const Promise = require("bluebird");
const logger = require('../logger')('topics-consumer');
const {KafkaConsumer} = require('node-rdkafka');

module.exports = function (host = '127.0.0.1',
                           group = 'kafka-ui-topic-fetch',
                           keepalive = false,
                           smallestOffset = false,
                           persistOffset = false,
                           ignoreTopics = ['__consumer_offsets']) {
    const self = this;

    self.connect = (toResolve, onFatal) => {
        logger.info(`connecting to kafka on '${host}'...`);

        let consumer = new KafkaConsumer({
            'group.id': group,
            'metadata.broker.list': host,
            'socket.keepalive.enable': keepalive,
            'enable.auto.offset.store': persistOffset,
            'enable.auto.commit': persistOffset,
            'auto.offset.reset': smallestOffset ? 'smallest' : 'end',
        });

        consumer.on('ready', () => {
            logger.debug("connected");
            return Promise.resolve(toResolve(consumer));
        }).on('connection.failure', (err) => {
            onFatal('connection.failure event', err);
        }).on('error', (err) => {
            onFatal('error event', err);
        });

        consumer.connect();
    };

    self.fetchTopics = (cb) => {
        return self.connect((consumer) =>
                consumer.getMetadata({}, (err, metadata) => {
                    if (!!err) {
                        logger.error(err);
                        cb(Promise.reject(err));
                        return;
                    }

                    consumer.disconnect();
                    logger.debug("topics fetched. disconnecting...");
                    let topics = metadata.topics.map(t => t.name).filter(t => ignoreTopics.indexOf(t) === -1);
                    cb(Promise.resolve(topics));
                }),
            (cause, err) => {
                logger.error(`cause ${cause} ${err}`);
                process.exit(1);
            })
    };


    self.topicsFetchLoop = (cb) => {
        return Promise.delay(10000).then(() => {
            return self.fetchTopics((result) => {
                return result.catch(err => {
                    logger.fatal(err);
                    process.exit(1);
                }).then(topics => {
                    cb(topics);
                    topicsFetchLoop(cb);
                });
            });
        });
    };

    return self.topicsFetchLoop;
};
