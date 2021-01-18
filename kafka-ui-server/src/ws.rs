use log::*;
use std::net::SocketAddr;
use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::{tungstenite::Error, accept_hdr_async, accept_async, WebSocketStream};
use tungstenite::{Result, Message, accept};
use tungstenite::handshake::server::{Request, Response};
use futures::{StreamExt, SinkExt, future};
use uuid::Uuid;
use crate::rethink;
use std::sync::{Arc};
use path_tree::PathTree;
use std::cell::RefCell;
use stream_cancel::{Trigger, Valved};
use serde::{Deserialize, Serialize};
use strum_macros::EnumString;
use std::collections::HashMap;
use crate::ws::WsCommand::{Topics, Messages};
use futures::executor::block_on;
use tokio::sync::mpsc::{Sender, Receiver, channel};
use crate::rethink::Rethink;
use tokio::sync::Mutex;
use std::convert::TryInto;
use std::process::Output;

pub struct Empty {}

#[derive(Serialize, Deserialize, Debug)]
pub enum HandlerOutput {
    #[serde(alias = "Topic", rename(serialize = "topic", deserialize = "topic"))]
    Topic(rethink::Topic),
    #[serde(alias = "Message", rename(serialize = "message", deserialize = "message"))]
    Message(rethink::InMessageRaw),
}

#[derive(Debug)]
pub enum HandlerCommand {
    Topics,
    Messages(MessagesRequest),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MessagesRequest {
    pub filters: Vec<Filter>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Filter {
    pub parameter: String,
    pub operator: Operator,
    pub value: String,
}

#[derive(Serialize, Deserialize, Debug, EnumString)]
pub enum Operator {
    #[strum(serialize = "eq")]
    #[serde(alias = "Eq", rename(serialize = "eq", deserialize = "eq"))]
    Eq,
    #[strum(serialize = "ne")]
    #[serde(alias = "Ne", rename(serialize = "ne", deserialize = "ne"))]
    Ne,
    #[strum(serialize = "gt")]
    #[serde(alias = "Gt", rename(serialize = "gt", deserialize = "gt"))]
    Gt,
    #[strum(serialize = "ge")]
    #[serde(alias = "Ge", rename(serialize = "ge", deserialize = "ge"))]
    Ge,
    #[strum(serialize = "lt")]
    #[serde(alias = "Lt", rename(serialize = "lt", deserialize = "lt"))]
    Lt,
    #[strum(serialize = "le")]
    #[serde(alias = "Le", rename(serialize = "le", deserialize = "le"))]
    Le,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WsRequest {
    pub request: WsCommand,
}

#[derive(Serialize, Deserialize, Debug, EnumString, Eq, Hash, Clone)]
pub enum WsCommand {
    #[strum(serialize = "topics")]
    #[serde(alias = "Topics", rename(serialize = "topics", deserialize = "topics"))]
    Topics,
    #[strum(serialize = "messages")]
    #[serde(alias = "Messages", rename(serialize = "messages", deserialize = "messages"))]
    Messages,
}

impl PartialEq for WsCommand {
    fn eq(&self, other: &Self) -> bool {
        self == other
    }
}

async fn accept_connection(peer: SocketAddr, stream: TcpStream, uuid: uuid::Uuid, r: Arc<rethink::Rethink>) {
    info!("accepting '{}' tcp connection for peer '{}'...", uuid, peer);

    if let Err(e) = handle_connection(peer, stream, uuid, r.clone()).await {
        match e {
            Error::ConnectionClosed | Error::Protocol(_) | Error::Utf8 => (),
            err => error!("Error processing connection: {}", err),
        }
    }
}

async fn handle_connection(peer: SocketAddr, stream: TcpStream, uuid: uuid::Uuid, rethink: Arc<rethink::Rethink>) -> Result<()> {
    info!("start handing connection '{}' for peer '{}'...", uuid, peer);

    let mut path = String::new();

    let mut ws_stream = accept_async(stream).await.expect("failed to accept");

    info!("handing connection '{}' with path '{}' for peer '{}'...", uuid, path, peer);

    let handler = Handler::new(rethink.clone(), uuid.clone());
    let handler_commands_unlocked = handler.commands_tx.lock().await;
    let mut handler_output_unlocked = handler.output_rx.lock().await;
    handler.clone().start();

    loop {
        tokio::select! {
                Some(handler_output) = handler_output_unlocked.recv() => {
                    ws_stream.send(Message::Text(serde_json::to_string(&handler_output).unwrap())).await;
                },
                Some(msg) = ws_stream.next() => {
                    if msg.is_err() {
                        info!("connection '{}': ws connection closed", uuid);
                        break
                    }

                    info!("connection '{}': message received - {:?}", uuid, msg);
                    let data = &*msg?.into_data();
                    let request = serde_json::from_slice::<WsRequest>(data).unwrap();

                    match request.request {
                        Topics => {
                            handler_commands_unlocked.send(HandlerCommand::Topics).await;
                        }
                        Messages => {
                            let messages_request = serde_json::from_slice::<MessagesRequest>(data).unwrap();
                            handler_commands_unlocked.send(HandlerCommand::Messages(messages_request)).await;
                        }
                    }
                },
                else => { break }
            }
    }

    Ok(())
}

pub async fn start_ws(r: Arc<rethink::Rethink>) {
    let addr = "127.0.0.1:9002";
    let listener = TcpListener::bind(&addr).await.expect("can't listen");
    info!("start listening on: {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        let uuid = Uuid::new_v4();
        let peer = stream.peer_addr().expect("connected streams should have a peer address");
        tokio::spawn(accept_connection(peer, stream, uuid, r.clone()));
    }
}

struct Handler {
    client_uuid: Uuid,
    rethink: Arc<Rethink>,
    commands_tx: Mutex<Sender<HandlerCommand>>,
    commands_rx: Mutex<Receiver<HandlerCommand>>,

    output_tx: Mutex<Sender<HandlerOutput>>,
    output_rx: Mutex<Receiver<HandlerOutput>>,

    messages_bus_tx: Mutex<Sender<rethink::InMessageRaw>>,
    messages_bus_rx: Mutex<Receiver<rethink::InMessageRaw>>,

    messages_commands_tx: Mutex<Sender<MessagesRequest>>,
    messages_commands_rx: Mutex<Receiver<MessagesRequest>>,

    topics_bus_tx: Mutex<Sender<rethink::Topic>>,
    topics_bus_rx: Mutex<Receiver<rethink::Topic>>,

    topics_commands_tx: Mutex<Sender<Empty>>,
    topics_commands_rx: Mutex<Receiver<Empty>>,
}

impl Handler {
    pub fn new(rethink: Arc<Rethink>, client_uuid: Uuid) -> Arc<Self> {
        let (commands_tx, commands_rx) = channel(1);
        let (output_tx, output_rx) = channel(100);
        let (messages_tx, messages_rx) = channel(1000);
        let (topics_tx, topics_rx) = channel(1);

        let (messages_commands_tx, messages_commands_rx) = channel(1);
        let (topics_commands_tx, topics_commands_rx) = channel(1);


        Arc::from(Handler {
            client_uuid,
            rethink,

            commands_tx: Mutex::new(commands_tx),
            commands_rx: Mutex::new(commands_rx),

            output_tx: Mutex::new(output_tx),
            output_rx: Mutex::new(output_rx),

            messages_bus_tx: Mutex::new(messages_tx),
            messages_bus_rx: Mutex::new(messages_rx),

            topics_bus_rx: Mutex::new(topics_rx),
            topics_bus_tx: Mutex::new(topics_tx),

            messages_commands_tx: Mutex::new(messages_commands_tx),
            messages_commands_rx: Mutex::new(messages_commands_rx),

            topics_commands_rx: Mutex::new(topics_commands_rx),
            topics_commands_tx: Mutex::new(topics_commands_tx),
        })
    }

    fn start(self: Arc<Self>) {
        tokio::task::spawn(self.clone().fw_topics());
        tokio::task::spawn(self.clone().fw_messages());
        tokio::task::spawn(self.clone().command_dispatcher());
    }

    async fn fw_topics(self: Arc<Self>) {
        let client_uuid = self.client_uuid.clone();
        info!("connection '{}' fw_topics - starting...", client_uuid);

        let mut commands_rx_unlocked = self.topics_commands_rx.lock().await;
        let mut canceller: RefCell<Option<Trigger>> = RefCell::from(None);

        loop {
            commands_rx_unlocked.recv().await;

            if let (Some(c)) = canceller.take() {
                info!("connection '{}' fw_topics - cancelling...", client_uuid);
                c.cancel();
            }

            info!("connection '{}' fw_topics - starting pipe...", client_uuid);

            let (cancel_tx, cancel_rx) = tokio::sync::oneshot::channel();
            let stream = self.rethink.clone().topics_subscriber();
            let mut topics_tx_unlocked = self.topics_bus_tx.lock().await.clone();

            tokio::spawn(async move {
                let (cancel, mut stream) = Valved::new(stream);
                cancel_tx.send(cancel).unwrap();

                while let Some(topic) = stream.next().await {
                    topics_tx_unlocked.send(rethink::Topic { topic: topic.topic.clone() }).await;
                }
            });

            canceller = RefCell::from(Some(cancel_rx.await.unwrap()));
        }
    }

    async fn fw_messages(self: Arc<Self>) {
        let client_uuid = self.client_uuid.clone();
        info!("connection '{}' fw_topics - starting...", client_uuid);
        let mut commands_rx_unlocked = self.messages_commands_rx.lock().await;
        let mut subscribe_canceller: RefCell<Option<tokio::sync::oneshot::Sender<Empty>>> = RefCell::from(None);
        let mut pipe_canceller: RefCell<Option<tokio::sync::oneshot::Sender<Empty>>> = RefCell::from(None);

        loop {
            let command = commands_rx_unlocked.recv().await.unwrap();

            if let (Some(c)) = subscribe_canceller.take() {
                info!("connection '{}' fw_messages - cancelling subscriber...", client_uuid);
                c.send(Empty {});
            }

            if let (Some(c)) = pipe_canceller.take() {
                info!("connection '{}' fw_messages - cancelling piper...", client_uuid);
                c.send(Empty {});
            }

            info!("connection '{}' fw_messages - starting pipe...", client_uuid);

            let (subscribe_cancel_tx, subscribe_cancel_rx) = tokio::sync::oneshot::channel::<Empty>();
            subscribe_canceller = RefCell::from(Some(subscribe_cancel_tx));

            let (pipe_cancel_tx, mut pipe_cancel_rx) = tokio::sync::oneshot::channel::<Empty>();
            pipe_canceller = RefCell::from(Some(pipe_cancel_tx));

            let (rethink_msg_tx, mut rethink_msg_rx) = channel(100);
            tokio::spawn(self.rethink.clone().subscribe(command.filters, rethink_msg_tx, subscribe_cancel_rx));

            let mut bus = self.messages_bus_tx.lock().await.clone();

            tokio::spawn(async move {
                loop {
                    tokio::select! {
                        Some(message) = rethink_msg_rx.recv() => {bus.send(message).await;},
                        _ = &mut pipe_cancel_rx => break,
                    }
                }
            });
        }
    }

    async fn command_dispatcher(self: Arc<Self>) {
        let mut commands_rx_unlocked = self.commands_rx.lock().await;
        let mut topics_bus_rx_unlocked = self.topics_bus_rx.lock().await;
        let mut messages_bus_rx_unlocked = self.messages_bus_rx.lock().await;
        let topics_commands_tx_unlocked = self.topics_commands_tx.lock().await;
        let messages_commands_tx_unlocked = self.messages_commands_tx.lock().await;
        let output_tx_unlocked = self.output_tx.lock().await;

        loop {
            tokio::select! {
                Some(topic) = topics_bus_rx_unlocked.recv() => {
                    output_tx_unlocked.send(HandlerOutput::Topic(topic)).await;
                },
                Some(message) = messages_bus_rx_unlocked.recv() => {
                    output_tx_unlocked.send(HandlerOutput::Message(message)).await;
                },
                Some(command_request) = commands_rx_unlocked.recv() => {
                    info!("connection '{}' command interpreter: received command - {:?}", self.client_uuid, command_request);
                    match command_request {
                         HandlerCommand::Topics => {
                            topics_commands_tx_unlocked.send(Empty{}).await;
                         }
                         HandlerCommand::Messages(message_request) => {
                            messages_commands_tx_unlocked.send(message_request).await;
                         }
                    }
                },
                else => { break }
            }
        }
    }
}
