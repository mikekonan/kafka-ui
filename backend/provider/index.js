const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./lib/logger')('api');
const Rethink = require("./lib/rethink");

const port = process.env.PROVIDER_PORT || 3001;
const rethinkHost = process.env.RETHINK_HOST || '127.0.0.1';

const head = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
};

const aliveMsg = {ping: true};

const write = (writable, obj) => {
    logger.debug(`writing ${JSON.stringify(obj)}`)
    if (!!writable) {
        writable.write(`data: ${JSON.stringify(obj)}\n\n`)
        writable.flush();
    }
};

const writeEvery = (timeout, writable, obj) => {
    return setInterval(() => write(writable, obj), timeout)
};

let toRethinkTableName = (name) => name.replace(".", "_dot_").replace("-", "_hyphen_");
let fromRethinkTableName = (name) => name.replace("_dot_", ".").replace("_hyphen_", "-");

const app = express();

app.get('/messages', (req, res) => {
    res.writeHead(200, head);

    let id = uuid();
    let interval;

    logger.info(`processing GET /messages for '${id}'`);
    let closedByClient = false;

    const rethink = new Rethink({host: rethinkHost, db: "topics"});
    rethink.connect()
        .then(() => {
            interval = writeEvery(15000, res, aliveMsg);

            rethink.changes(
                {
                    table: toRethinkTableName(req.query.topic),
                    limit: 20,
                    orderBy: 'offset',
                    onRow: (err, data) => {
                        if (!!err) {
                            if (closedByClient) {
                                return
                            }

                            res.connection.destroy();
                            rethink.close();
                            logger.error(err);
                            return
                        }

                        write(res, data['new_val']);
                    }
                })
        })
        .catch(err => {
            if (!closedByClient) {
                clearInterval(interval);
                logger.error(err);
                res.connection.destroy();
                rethink.close();
            }
        });

    res.on('close', () => {
        clearInterval(interval);
        logger.info(`${id} connection closed by client`);
        rethink.close();
        closedByClient = true;
    });
});

app.get('/topics', (req, res) => {
    res.writeHead(200, head);

    let id = uuid();
    let interval;
    let closedByClient = false;

    logger.info(`processing GET /topics for '${id}'`);

    const rethink = new Rethink({host: rethinkHost, db: "rethinkdb"});

    rethink.connect()
        .then(() => {
            interval = writeEvery(15000, res, aliveMsg);

            rethink.changes(
                {
                    table: "table_config",
                    onRow: (err, data) => {
                        if (!!err) {
                            if (closedByClient) {
                                return
                            }

                            res.connection.destroy();
                            rethink.close();
                            logger.error(err);
                            return
                        }

                        if (data['new_val'].db === "topics") {
                            write(res, {topic: fromRethinkTableName(data['new_val'].name)});
                        }
                    }
                })
        })
        .catch(err => {
            if (!closedByClient) {
                clearInterval(interval);
                logger.error(err);
                res.connection.destroy();
                rethink.close();
            }
        });

    res.on('close', () => {
        clearInterval(interval);
        logger.info(`${id} connection closed by client`);
        rethink.close();
        closedByClient = true;
    });
});

app.listen(port, () => logger.info(`api listening on ${port}`));