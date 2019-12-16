const Writable = require("readable-stream").Writable;
const r = require('rethinkdb');
const logger = require('../logger')('rethink-producer');
const Promise = require("bluebird");

class RethinkProducer extends Writable {
    constructor({host = '127.0.0.1', port = 28015, db = 'topics'} = {}) {
        super({objectMode: true});
        const self = this;
        self.conf = {db: db, host: host, port: port};
    }

    connect() {
        let self = this;
        return new Promise((resolve, reject) => {
            logger.info("connecting...");
            return r.connect(self.conf).catch((err) => reject(err)).then(conn => {
                self.conn = conn;
                logger.info("connected");

                r.dbList().run(conn).then(list => {
                    if (list.includes(self.conf.db)) {
                        logger.info(`'${self.conf.db}' database already exist`);
                        return
                    }

                    logger.info(`'${self.conf.db}' database not exist`);
                    r.dbCreate(self.conf.db).run(conn).then(() => {
                        logger.info(`'${self.conf.db}' database created`)
                    });
                });
                resolve(self);
            });
        });
    }

    _write(message, _, callback) {
        if (!!!message.topic || message.topic === '') {
            callback();
            return
        }

        let self = this;

        r.table(message.topic).run(self.conn).then(cursor => {
            console.log(message, cursor);
        });

        callback();
    }

    _destroy() {
        logger.info("closing rethink connection...")
        this.conn.close();
    }
}

module.exports = RethinkProducer;
