const Writable = require("readable-stream").Writable;
const r = require('rethinkdb');
const logger = require('../logger')('rethink-producer');
const Promise = require("bluebird");

let tables = {};

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
                return conn;
            }).then(conn => {
                return r.dbList().contains(self.conf.db)
                    .do((databaseExists) => r.branch(databaseExists, {dbs_created: 0}, r.dbCreate(self.conf.db)))
                    .run(conn).then((result) => {
                        logger.info(`${result.dbs_created === 0 ?
                            `'${self.conf.db}' database already exists` :
                            `'${self.conf.db}' database created`}`);
                        return resolve(self)
                    });
            });
        });
    }

    _normalizeTableName(topic) {
        return topic.replace(".", "_dot_").replace("-", "_hyphen_");
    }

    _writeMsg(topic, message, callback) {
        let self = this;
        let tableName = self._normalizeTableName(topic);

        logger.debug(`writing message on ${message.topic} topic into ${tableName} table`);
        return r.table(tableName).insert({
            topic: message.topic,
            headers: message.headers,
            offset: message.offset,
            partition: message.partition,
            timestamp: message.timestamp,
            at: r.epochTime(message.timestamp / 1000),
            size: message.size,
        }).run(self.conn).finally(() => callback())
    }

    _write(message, _, callback) {
        if (!!!message.topic || message.topic === '') {
            callback();
            return
        }

        let self = this;
        let tableName = self._normalizeTableName(message.topic);

        if (!!!tables[tableName]) {
            return r.tableList().contains(tableName)
                .do((tableExists) => r.branch(tableExists, {tables_created: 0}, r.tableCreate(tableName)))
                .run(self.conn).then((result) => {
                    logger.info(`${result.tables_created === 0 ?
                        `'${tableName}' table already exists` :
                        `'${tableName}' table created`}`);

                    tables[tableName] = true;

                    if (result.tables_created !== 0) {
                        return Promise.all(
                            [r.table(tableName).indexCreate("offset").run(self.conn),
                                r.table(tableName).indexCreate("at").run(self.conn),
                                r.table(tableName).indexCreate("timestamp").run(self.conn)]).then(() => Promise.resolve());
                    }

                    return Promise.resolve();
                }).then(() => self._writeMsg(tableName, message, callback))
        }

        return self._writeMsg(tableName, message, callback)
    }

    _destroy() {
        logger.info("closing rethink connection...")
        this.conn.close();
    }
}

module.exports = RethinkProducer;
