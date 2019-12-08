const {KafkaConsumer} = require('node-rdkafka');
const {Readable} = require('readable-stream');
const logger = require('./logger')('consumer');

const errListener = (listener, event, cb) => {
    listener.on(event, (err) => {
        logger.error(
            {
                event: event,
                error: !!err ? err.message : "error is empty",
            });
        cb();
    })
};

class Consumer extends Readable {
    constructor({host = 'kafka', group = 'kafka-ui', keepalive = true, smallestOffset = true, persistOffset = false, ignoreTopics = ['__consumer_offsets']} = {}) {
        super({objectMode: true});
        const self = this;
        const consumerOpts = {
            'group.id': group,
            'metadata.broker.list': host,
            'socket.keepalive.enable': keepalive,
            'enable.auto.offset.store': persistOffset,
            'enable.auto.commit': persistOffset,
            'auto.offset.reset': smallestOffset ? 'smallest' : 'end',
        };

        const metadataConsumer = new KafkaConsumer(consumerOpts, {});
        ['connection.failure', 'error', 'event.error'].forEach(e => errListener(metadataConsumer, e, () => process.exit(1)));

        metadataConsumer.on('ready', () => {
            metadataConsumer.getMetadata({}, (err, metadata) => {
                if (!!err) {
                    logger.fatal(
                        {
                            error: err.message,
                            message: "err during fetching kafka info, preparing for shutdown...",
                        });
                }

                self.connect(metadata.topics.map(t => t.name).filter(t => ignoreTopics.indexOf(t) === -1));
                metadataConsumer.disconnect();
            });
        });

        metadataConsumer.connect();

        self.connect = (topics) => {
            logger.info({
                'message': "subscribing to topics",
                'topics': topics,
            });

            self.stream = KafkaConsumer.createReadStream(consumerOpts, {
                'auto.commit.enable': persistOffset,
                'auto.offset.reset': smallestOffset ? 'smallest' : 'end',
            }, {topics: topics});
            ['connection.failure', 'disconnected', 'error', 'event.error'].forEach(e => errListener(self.stream, e, () => self.emit('close')));

            self.stream.on('close', () => {
                logger.info('KafkaConsumerStream closed')
            });

            self.stream.on('data', async (message) => {
                let headers = [];
                if (!!message.headers) {
                    headers = message.headers.map(h => {
                        let key = Object.keys(h)[0];
                        let val = h[key].toString();
                        let obj = {};
                        obj[key] = val;
                        return obj;
                    });
                }

                let msg = {
                    topic: message.topic,
                    headers: headers,
                    offset: message.offset,
                    partition: message.partition,
                    timestamp: message.timestamp,
                    size: message.size,
                };

                try {
                    msg.payload = JSON.parse(message.value.toString())
                } catch (e) {
                    msg.payload = {};
                    msg.error = e.message;
                }


                self.push(msg);
            });
        };
    }

    _read() {
    }

    _destroy() {
        this.stream.close()
    }
}

module.exports = Consumer;
