use serde::{Deserialize, Serialize};
use serde_json::{json, value::RawValue, Value};
use std::{sync::Mutex, sync::RwLock, collections::HashSet, time};
use bus_queue::{bounded, Publisher, Subscriber};
use log::*;
use futures::{SinkExt, StreamExt, executor::block_on, compat::Stream01CompatExt, Stream};
use reql::{Run, Arg, IntoArg, RepeatedField};
use reql_macros::args;
use reql_types::{Change, WriteStatus};
use std::sync::Arc;
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use tokio_timer::Interval;
use std::time::{Instant, Duration};
use async_stream::stream;
use crate::ws;
use crate::ws::{Operator, Filter};
use ql2::proto::{Term, Datum, Datum_DatumType};
use tokio::sync::mpsc::{Sender};
use stream_cancel::Valved;

#[derive(Serialize, Deserialize, Debug, Eq, Hash)]
pub struct Topic {
    pub topic: String,
}

impl PartialEq for Topic {
    fn eq(&self, other: &Self) -> bool {
        self.topic == other.topic
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InMessageRaw {
    pub topic: String,
    pub headers: HashMap<String, String>,
    pub offset: i64,
    pub partition: i32,
    pub timestamp: i64,
    pub at: reql_types::DateTime,
    pub payload_size: i32,
    pub payload: Box<RawValue>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TableConf {
    db: String,
    name: String,
    id: String,
}

pub struct Rethink {
    topic_discovered_publisher: Mutex<Publisher<Topic>>,
    topic_discovered_subscriber: Subscriber<Topic>,
    topics_cache: Mutex<HashSet<String>>,
    rethink_client: reql::Client,
    rethink_connection: reql::Connection,
}

impl Rethink {
    pub fn new() -> Arc<Self> {
        let (publisher, subscriber) = bounded(100);
        let r = reql::Client::new();
        let conn = r.connect(reql::Config::default()).unwrap();

        Arc::new(Self {
            topic_discovered_publisher: Mutex::new(publisher),
            topic_discovered_subscriber: subscriber,
            topics_cache: Mutex::new(HashSet::new()),
            rethink_client: r,
            rethink_connection: conn,
        })
    }

    pub fn topics_subscriber(self: Arc<Self>) -> Subscriber<Topic> {
        self.topic_discovered_subscriber.clone()
    }

    pub fn topic_exists(self: Arc<Self>, topic: String) -> bool {
        self.topics_cache.lock().unwrap().contains(&*topic)
    }

    pub fn routine(self: Arc<Self>) {
        // tokio::task::spawn(self.fill_available_topics_routine());
    }

    async fn fill_available_topics_routine(self: Arc<Self>) {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(5));
        loop {
            self.clone().fill_available_topics().await;
            interval.tick().await;
        }
    }

    async fn fill_available_topics(self: Arc<Self>) {
        info!("trying to find new topics...");

        let table_name = "kafka-ui";
        let db_name = "test";

        let mut db_request = self.rethink_client
            .db(db_name)
            .table(table_name)
            .get_field("topic")
            .distinct()
            .run::<Vec<String>>(self.rethink_connection).unwrap().compat();

        while let Some(doc) = db_request.next().await {
            match doc {
                Ok(doc) => {
                    match doc {
                        Some(reql::Document::Expected(topics)) => topics.iter().for_each(|topic| {
                            let mut locked_cache = self.topics_cache.lock().unwrap();
                            if !locked_cache.contains(&topic.clone()) {
                                info!("storing new topic {}...", topic.to_string());
                                locked_cache.insert(topic.to_string());
                                block_on(self.topic_discovered_publisher.lock().unwrap().send(Topic { topic: topic.to_string() }));
                            }
                        }),
                        Some(reql::Document::Unexpected(_)) => {} //handle err
                        None => {}                                  //handle err
                    }
                }
                Err(doc) => {
                    error!("{:?}", doc);
                }
            }
        }
    }

    pub async fn write<T: Serialize>(self: Arc<Self>, message: T) {
        let table_name = "kafka-ui";
        let db_name = "test";
        self.rethink_client
            .db(db_name)
            .table(table_name)
            .insert(json!(message))
            .run::<WriteStatus>(self.rethink_connection).unwrap().compat().next().await.unwrap().unwrap();
    }

    pub fn get_all_arg(self: Arc<Self>, values: Vec<String>, _type: Datum_DatumType) -> Arg {
        let terms = values.clone().iter().map(|v| {
            let mut key = Datum::new();
            key.set_field_type(_type);
            key.set_r_str(v.clone());

            let mut arr = Datum::new();
            arr.set_field_type(ql2::proto::Datum_DatumType::R_ARRAY);
            arr.set_r_array(RepeatedField::from_vec(vec!(key)));

            let mut term = ql2::proto::Term::new();
            term.set_datum(arr);
            term
        }).collect::<Vec<Term>>();

        let mut term = ql2::proto::Term::new();
        term.set_args(RepeatedField::from_vec(terms));

        let mut arg = Arg::new();
        arg.set_term(Ok(term));
        arg
    }

    pub async fn subscribe(self: Arc<Self>, mut filters: Vec<ws::Filter>, in_tx: Sender<InMessageRaw>, mut cancel_rx: tokio::sync::oneshot::Receiver<ws::Empty>) {
        let table_name = "kafka-ui";
        let db_name = "test";

        let mut query = self.rethink_client.db(db_name).table(table_name);

        let topics = filters.iter()
            .filter(|f| f.parameter == "topic" && std::mem::discriminant(&f.operator) == std::mem::discriminant(&Operator::Eq))
            .map(|f| f.value.clone())
            .collect::<Vec<String>>();

        if topics.len() > 0 {
            let arg = self.clone().get_all_arg(topics, Datum_DatumType::R_STR);
            query = query.get_all(args!(arg, {index: "topic"}))
        }

        // for filter in filters.iter() {
        //     match filter.operator {
        //         Operator::Eq => {
        //             query = query.filter(args!(|doc| { doc.get_field(filter.parameter.clone()).eq(filter.value.clone()) }));
        //         }
        //         Operator::Lt => {
        //             query = query.filter(args!(|doc| { doc.get_field(filter.parameter.clone()).lt(filter.value.clone()) }));
        //         }
        //         Operator::Ne => {
        //             query = query.filter(args!(|doc| { doc.get_field(filter.parameter.clone()).ne(filter.value.clone()) }));
        //         }
        //         Operator::Gt => {
        //             query = query.filter(args!(|doc| { doc.get_field(filter.parameter.clone()).gt(filter.value.clone()) }));
        //         }
        //         Operator::Ge => {
        //             query = query.filter(args!(|doc| { doc.get_field(filter.parameter.clone()).ge(filter.value.clone()) }));
        //         }
        //         Operator::Le => {
        //             query = query.filter(args!(|doc| { doc.get_field(filter.parameter.clone()).le(filter.value.clone()) }));
        //         }
        //     }
        // }

        let mut data_stream = query
            .changes()
            .with_args(args!({include_initial: true}))
            .run::<Change<InMessageRaw, InMessageRaw>>(self.rethink_connection)
            .unwrap()
            .compat();

        loop {
            tokio::select! {
                _ = &mut cancel_rx => {
                  info!("closing data_stream...");
                  break
                },
                Some(doc) = data_stream.next() => {
                      match doc {
                        Ok(doc) => {
                            match doc {
                                Some(reql::Document::Expected(change)) => {
                                    let message = change.new_val.unwrap();
                                    debug!("processing message for topic - '{}' with offset '{}'", message.topic, message.offset);
                                    in_tx.send(message).await;
                                }
                                Some(reql::Document::Unexpected(_)) => break,
                                None => break
                            }
                        }
                        Err(doc) => {
                            error!("{:?}", doc);
                            break
                        }
                    }
                }
            }
        }
    }
}