const {KafkaConsumer} = require('node-rdkafka');
const {Readable} = require('readable-stream');
const logger = require('../logger')('message-consumer');

let isClosing = false;

const errListener = (listener, event, cb) => {
    listener.on(event, (err) => {
            logger.error(`event - '${event}', error - '${!!err ? err.message : "error is empty"}'`);
            cb(err);
        }
    )
};

class MessageReader extends Readable {
    constructor({host = 'kafka', group = 'kafka-ui', smallestOffset = true, persistOffset = false, topics} = {}) {
        super({objectMode: true});
        const self = this;

        (function connect() {
            {
                if (isClosing) {
                    setTimeout(() => connect(), 50);
                    return
                }

                logger.info(`subscribing to topics - '${topics}'`);

                self.consumer = new KafkaConsumer({
                        'group.id': group,
                        'metadata.broker.list': host,
                        'auto.offset.reset': smallestOffset ? 'smallest' : 'end'
                    }, {},
                    {waitInterval: 0, fetchSize: 200},
                );

                self.consumer.connect();

                ['connection.failure', 'disconnected', 'error', 'event.error']
                    .forEach(e => errListener(self.consumer, e, () => self._destroy()));

                self.consumer
                    .on('close', () => {
                        logger.info('consumer closed');
                        isClosing = false;
                    })
                    .on('ready', () => {
                        self.consumer.subscribe(topics);
                        setInterval(() => self.consumer.consume(200), 1000);
                    })
                    .on('data', (message) => self._on_message(message));
            }
        })()
    }

    _on_message(message) {
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

        this.push(msg);
    }

    _read() {
    }

    _destroy() {
        isClosing = true;
        logger.info("closing consumer...");
        this.consumer.disconnect();
    }
}

module.exports = MessageReader;
