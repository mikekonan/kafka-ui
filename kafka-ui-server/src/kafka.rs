use futures::{future, StreamExt};
use log::{info, trace, warn};

use crate::rethink;
use crate::rethink::{Rethink};
use chrono::{DateTime, TimeZone, Utc};
use futures::executor::block_on;
use rdkafka::client::ClientContext;
use rdkafka::config::{ClientConfig, RDKafkaLogLevel};
use rdkafka::consumer::stream_consumer::StreamConsumer;
use rdkafka::consumer::{CommitMode, Consumer, ConsumerContext, MessageStream, Rebalance};
use rdkafka::error::KafkaResult;
use rdkafka::message::{Headers, Message};
use rdkafka::metadata::MetadataTopic;
use rdkafka::topic_partition_list::TopicPartitionList;
use rdkafka::util::TokioRuntime;
use serde_json::json;
use serde_json::value::RawValue;
use std::borrow::BorrowMut;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::io::empty;
use std::rc::Rc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use stream_cancel::{Trigger, Valved};
use tokio::sync::mpsc::{channel, Receiver, Sender};
use tokio::sync::Mutex;

struct Context;

impl ClientContext for Context {}

impl ConsumerContext for Context {
    fn pre_rebalance(&self, rebalance: &Rebalance) {
        info!("Pre rebalance {:?}", rebalance);
    }

    fn post_rebalance(&self, rebalance: &Rebalance) {
        info!("Post rebalance {:?}", rebalance);
    }

    fn commit_callback(&self, result: KafkaResult<()>, _offsets: &TopicPartitionList) {
        info!("Committing offsets: {:?}", result);
    }
}

type KafkaConsumer = StreamConsumer<Context>;

struct Empty {}

pub struct Kafka {
    brokers: String,
    group_id: String,

    topics_to_exclude: HashSet<String>,
    rethink: Arc<rethink::Rethink>,
    topics_cache: Mutex<HashSet<String>>,

    stopped_tx: Mutex<Sender<Empty>>,
    stopped_rx: Mutex<Receiver<Empty>>,

    listener_controller_tx: Mutex<Sender<bool>>,
    listener_controller_rx: Mutex<Receiver<bool>>,

    trigger_tx: Mutex<Sender<Trigger>>,
    trigger_rx: Mutex<Receiver<Trigger>>,
}

impl Kafka {
    pub fn new(
        brokers: String,
        group_id: String,
        topics_to_exclude: HashSet<String>,
        rethink: Arc<rethink::Rethink>,
    ) -> Arc<Self> {
        let (listener_controller_tx, listener_controller_rx) = channel(1);
        let (stopped_tx, stopped_rx) = channel(1);
        let (trigger_tx, trigger_rx) = channel(1);


        Arc::new(Self {
            brokers,
            group_id,
            topics_to_exclude,
            rethink,
            topics_cache: Mutex::new(HashSet::new()),
            stopped_tx: Mutex::new(stopped_tx),
            stopped_rx: Mutex::new(stopped_rx),
            listener_controller_tx: Mutex::new(listener_controller_tx),
            listener_controller_rx: Mutex::new(listener_controller_rx),
            trigger_tx: Mutex::new(trigger_tx),
            trigger_rx: Mutex::new(trigger_rx),
        })
    }

    async fn start(self: Arc<Self>) {
        let context = Context;
        let consumer: KafkaConsumer = ClientConfig::new()
            .set("group.id", self.group_id.as_str())
            .set("bootstrap.servers", self.brokers.as_str())
            .set("metadata.max.age.ms", "30000")
            .set("enable.partition.eof", "false")
            .set("session.timeout.ms", "6000")
            .set("statistics.interval.ms", "30000")
            .set("enable.auto.commit", "false")
            .set("auto.offset.reset", "smallest")
            .set_log_level(RDKafkaLogLevel::Info)
            .create_with_context(context)
            .expect("Consumer creation failed");

        let cached_topics = block_on(self.clone().load_topics());
        let topics: Vec<&str> = cached_topics.iter().map(|s| s.as_str()).collect();
        info!("subscribing to: {:?}...", topics);
        consumer.subscribe(&topics).expect("failed to subscribe");

        let stream = consumer.start();
        let (cancel, stream) = Valved::new(stream);

        let trigger_tx_locked = self.trigger_tx.lock().await;
        trigger_tx_locked.send(cancel).await;
        drop(trigger_tx_locked);

        stream.for_each(|message| {
            match message {
                Err(e) => warn!("Error: {}", e),
                Ok(m) => {
                    let payload = match m.payload_view::<str>() {
                        None => "",
                        Some(Ok(s)) => s,
                        Some(Err(e)) => {
                            warn!("Error while deserializing message payload: {:?}", e);
                            ""
                        }
                    };

                    trace!("key: '{:?}', payload: '{}', topic: {}, partition: {}, offset: {}, timestamp: {:?}", m.key(), payload, m.topic(), m.partition(), m.offset(), m.timestamp());

                    let mut headers_map = HashMap::new();
                    if let Some(headers) = m.headers() {
                        for i in 0..headers.count() {
                            let header = headers.get(i).unwrap();
                            headers_map.insert(
                                header.0.to_string(),
                                String::from_utf8_lossy(header.1).to_string(),
                            );
                        }
                    }

                    let payload_str = &String::from_utf8_lossy(m.payload().unwrap()).trim().to_string();
                    let json_parse_result = RawValue::from_string(payload_str.to_string());

                    match json_parse_result {
                        Ok(result) => tokio::spawn(self.rethink.clone().write(
                            rethink::InMessageRaw {
                                topic: m.topic().to_string(),
                                headers: headers_map,
                                offset: m.offset(),
                                partition: m.partition(),
                                timestamp: m.timestamp().to_millis().unwrap(),
                                at: reql_types::DateTime(Utc.timestamp_millis(m.timestamp().to_millis().unwrap())),
                                payload_size: m.payload_len() as i32,
                                payload: result,
                            },
                        )),
                        Err(_) => tokio::spawn(
                            self.rethink.clone().write(rethink::InMessage {
                                topic: m.topic().to_string(),
                                headers: headers_map,
                                offset: m.offset(),
                                partition: m.partition(),
                                timestamp: m.timestamp().to_millis().unwrap(),
                                at: reql_types::DateTime(Utc.timestamp_millis(m.timestamp().to_millis().unwrap())),
                                payload_size: m.payload_len() as i32,
                                payload: payload_str.to_string(),
                            }),
                        ),
                    };

                    consumer.commit_message(&m, CommitMode::Async).unwrap();
                }
            };

            future::ready(())
        }).await
    }


    async fn commands_interpreter(self: Arc<Self>) {
        let mut listener_controller_unlocked = self.listener_controller_rx.lock().await;
        let mut stopped_tx_unlocked = self.stopped_tx.lock().await;
        let mut trigger_tx_unlocked = self.trigger_rx.lock().await;
        let mut canceller: RefCell<Option<Trigger>> = RefCell::new(None);

        loop {
            info!("waiting for command...");
            if !listener_controller_unlocked.recv().await.unwrap() {
                info!("stream cancel command received...");
                if let (Some(c)) = canceller.take() {
                    info!("cancelling...");
                    c.cancel();
                }

                stopped_tx_unlocked.send(Empty {}).await;
                continue;
            }

            info!("stream start command received...");
            tokio::task::spawn(tokio_compat_02::FutureExt::compat(self.clone().start()));

            canceller = RefCell::from(Some(trigger_tx_unlocked.recv().await.unwrap()));
        }
    }

    async fn load_topics(self: Arc<Self>) -> Vec<String> {
        let unlocked = self.topics_cache.lock().await;
        unlocked
            .iter()
            .filter(|item| !self.topics_to_exclude.contains(item.clone()))
            .map(|s| String::from(s))
            .collect()
    }

    async fn fill_cache(self: Arc<Self>, topics: &[MetadataTopic]) -> bool {
        let mut locked_cache = self.topics_cache.lock().await;
        let mut not_contains = false;
        for topic in topics {
            if topic.error() != None {
                panic!(topic.error())
            }

            if !locked_cache.contains(topic.name()) {
                not_contains = true;
                info!("topic {} found", topic.name());
                locked_cache.insert(topic.name().to_string());
            }
        }

        not_contains
    }

    async fn topics_listener(self: Arc<Self>) {
        let mut listener_interval = tokio::time::interval(Duration::from_secs(1));
        let listener_controller_tx = self.listener_controller_tx.lock().await;
        let mut stopped_rx = self.stopped_rx.lock().await;

        let consumer: KafkaConsumer = ClientConfig::new()
            .set("bootstrap.servers", self.brokers.as_str())
            .set_log_level(RDKafkaLogLevel::Info)
            .create_with_context(Context)
            .expect("Consumer creation failed");

        loop {
            let metadata = consumer.fetch_metadata(None, Duration::from_secs(10)).expect("failed to fetch metadata");
            if block_on(self.clone().fill_cache(metadata.topics())) {
                listener_controller_tx.send(false).await;
                stopped_rx.recv().await;
                listener_controller_tx.send(true).await;
            }

            listener_interval.tick().await;
        }
    }

    pub fn routine(self: Arc<Self>) {
        tokio::task::spawn(self.clone().topics_listener());
        tokio::task::spawn(self.clone().commands_interpreter());
    }
}
