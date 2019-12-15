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
    constructor({host = 'kafka', group = 'kafka-ui', keepalive = true, smallestOffset = true, persistOffset = false, topics} = {}) {
        super({objectMode: true});

        const self = this;

        (function () {
            {
                logger.info(`subscribing to topics - '${topics}'`);

                self.stream = KafkaConsumer.createReadStream({
                    'group.id': group,
                    'metadata.broker.list': host,
                    'socket.keepalive.enable': keepalive,
                    'enable.auto.offset.store': persistOffset,
                    'enable.auto.commit': persistOffset,
                    'auto.offset.reset': smallestOffset ? 'smallest' : 'end',
                }, {
                    'auto.commit.enable': persistOffset,
                    'auto.offset.reset': smallestOffset ? 'smallest' : 'end',
                }, {topics: topics});

                ['connection.failure', 'disconnected', 'error', 'event.error'].forEach(e => errListener(self.stream, e, () => self.emit('close')));

                self.stream.on('close', () => {
                    logger.info('consumer closed')
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
            }
        })()
    }

    _read() {
    }

    _destroy() {
        logger.info("closing consumer...");
        this.stream.close();
    }
}

module.exports = Consumer;
