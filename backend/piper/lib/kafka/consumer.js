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

class Consumer extends Readable {
    constructor({host = '127.0.0.1', group = 'kafka-ui-messages-fetch', topics} = {}) {
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
                    }, {},
                    {waitInterval: 0, fetchSize: 200},
                );

                self.consumer.connect();

                ['connection.failure', 'error']
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
        if (!isClosing) {
            isClosing = true;
            logger.info("closing consumer...");
            this.consumer.disconnect();
            this.emit('close');
        }
    }
}

module.exports = Consumer;
