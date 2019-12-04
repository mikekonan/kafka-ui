const Kafka = require('node-rdkafka');

let topicsToIgnore = ['__consumer_offsets'];

let conf = {
    'group.id': 'kafka',
    'metadata.broker.list': 'kafka:9092',
};

let consumer = new Kafka.KafkaConsumer(conf, {});

let stream = null;

consumer.on('ready', () => {
    consumer.getMetadata(null, (err, metadata) => {
        if (!!err) {
            console.error(err);
            process.exit(1);
        }

        stream = Kafka.KafkaConsumer.createReadStream(conf, undefined, {
            topics: metadata.topics.map(t => t.name).filter(t => topicsToIgnore.indexOf(t) === -1)
        });

        stream.on('data', function (message) {
            let headers = message.headers.map(h => {
                let key = Object.keys(h)[0];
                let val = h[key].toString();
                let obj = {};
                obj[key] = val;
                return obj;
            });
            console.log(headers, message.topic, message.value.toString());
        });
    });
});


consumer.connect();