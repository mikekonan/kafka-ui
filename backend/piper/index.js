const kafkaTopic = require('./lib/kafka/topic');
const Consumer = require("./lib/kafka/consumer");
const Producer = require("./lib/rethink/producer");

let topicsState = [];
let consumer = null;

kafkaTopic(process.env.KAFKA_HOST || '127.0.0.1')(newTopicsState => {
    let diff = topicsState
        .filter(x => !newTopicsState.includes(x))
        .concat(newTopicsState.filter(x => !topicsState.includes(x)));

    if (diff.length > 0 && !!newTopicsState) {
        if (!!consumer) {
            consumer._destroy();
        }

        topicsState = newTopicsState;

        consumer = new Consumer({host: process.env.KAFKA_HOST || '127.0.0.1', topics: topicsState});

        new Producer({host: process.env.RETHINK_HOST || '127.0.0.1'})
            .connect().then(producer => consumer.pipe(producer));
    }
});