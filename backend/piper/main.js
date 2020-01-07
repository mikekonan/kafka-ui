const kafkaTopic = require('./lib/kafka/topic');
const Consumer = require("./lib/kafka/consumer");
const Producer = require("./lib/rethink/producer");

let topicsState = [];
let consumer = null;

kafkaTopic()(newTopicsState => {
    let diff = topicsState
        .filter(x => !newTopicsState.includes(x))
        .concat(newTopicsState.filter(x => !topicsState.includes(x)));

    if (diff.length > 0) {
        if (!!consumer) {
            consumer._destroy();
        }

        topicsState = newTopicsState;

        consumer = new Consumer({
            topics: topicsState
        });

        new Producer().connect().then(producer => consumer.pipe(producer));
    }
});