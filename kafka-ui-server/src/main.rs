#![feature(default_free_fn)]

mod rethink;
mod ws;
mod kafka;

use clap::{App, Arg};


#[macro_use]
extern crate lazy_static;

use futures::StreamExt;
use futures::executor::block_on;


#[tokio::main]
async fn main() {
    pretty_env_logger::init();

    let matches = App::new("consumer example")
        .version(option_env!("CARGO_PKG_VERSION").unwrap_or(""))
        .about("Simple command line consumer")
        .arg(
            Arg::with_name("brokers")
                .short("b")
                .long("brokers")
                .help("Broker list in kafka format")
                .takes_value(true)
                .default_value("127.0.0.1:9092"),
        )
        .arg(
            Arg::with_name("group-id")
                .short("g")
                .long("group-id")
                .help("Consumer group id")
                .takes_value(true)
                .default_value("kafka_ui_consumer_group"),
        )
        .arg(
            Arg::with_name("exclude-topics")
                .short("e")
                .long("exclude-topics")
                .help("Topic list to exclude")
                .takes_value(true)
                .multiple(true)
                .default_value("__consumer_offsets")
        )
        .get_matches();


    let brokers = matches.value_of("brokers").unwrap();
    let group_id = matches.value_of("group-id").unwrap();
    let topics = matches.values_of("exclude-topics").unwrap().map(|s| s.to_string()).collect();

    let rethink = rethink::Rethink::new();

    rethink.clone().routine();

    let kafka = kafka::Kafka::new(String::from(brokers), String::from(group_id), topics, rethink.clone());
    kafka.routine();

    ws::start_ws(rethink.clone()).await;
}

