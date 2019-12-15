const logger = require('./logger')('main');
const topicFetch = require('./topic');
const Consumer = require("./consumer");

let topicsState = [];
let consumer = null;

topicFetch()(newTopicsState => {
    let diff = topicsState
        .filter(x => !newTopicsState.includes(x))
        .concat(newTopicsState.filter(x => !topicsState.includes(x)));

    if (diff.length > 0) {
        if (!!consumer) {
            consumer._destroy();
        }

        topicsState = newTopicsState;

        logger.info(`Topics changed. Difference - '${diff}'. New topics to listen - '${topicsState}'`)
        consumer = new Consumer({
            topics: topicsState
        });

        consumer.on('data', (msg) => {
            if (!!msg.error) {
                logger.error(JSON.stringify(msg));
                return
            }
            logger.debug(JSON.stringify(msg));
        }).on('close', (err) => {
            logger.fatal(err);
            process.exit(1);
        });
    }
});