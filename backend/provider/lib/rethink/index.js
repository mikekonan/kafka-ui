const r = require('rethinkdb');
const logger = require('../logger')('rethink');

class Rethink {
    constructor({host = '127.0.0.1', port = 28015, db = 'topics'} = {}) {
        this.conf = {db: db, host: host, port: port};
    }

    connect() {
        return r.connect(this.conf)
            .catch(err => Promise.reject(err))
            .then(conn => {
                this.conn = conn;
                logger.info("connected");
                return Promise.resolve(conn);
            })
    };

    close() {
        this.conn.close();
    }

    changes(req) {
        let query = r.db(this.conf.db).table(req.table);
        if (!!req.orderBy) {
            query = query.orderBy({index: r.desc(req.orderBy)});
        }

        if (!!req.limit) {
            query = query.limit(req.limit);
        }

        return query.changes({includeInitial: true})
            .run(this.conn, (err, cursor) => {
                if (!!err) {
                    cursor.close();
                    logger.error(err);
                    return
                }


                cursor.each((err, val) => {
                    if (!!err) {
                        cursor.close();
                    }

                    req.onRow(err, val)
                });
            });
    };
}

module.exports = Rethink;