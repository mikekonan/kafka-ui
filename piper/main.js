const Kafka = require('node-rdkafka');

let topicsToIgnore = ['__consumer_offsets'];

let conf = {
    'group.id': 'kafka',
    'metadata.broker.list': 'kafka:9092',
};

let consumer = new Kafka.KafkaConsumer(conf, {});

let stream = null;

consumer.on('ready', (info) => {
    consumer.getMetadata(null, (err, metadata) => {
        if (!!err) {
            //TODO: log and exit
        }

        stream = Kafka.KafkaConsumer.createReadStream(conf, undefined, {
            topics: metadata.topics.map(t => t.name).filter(t => topicsToIgnore.indexOf(t) === -1)
        });

        stream.on('data', function (message) {
            console.log(message.topic, message.value.toString());
        });

    });
});


consumer.connect();