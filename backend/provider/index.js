const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./lib/logger')('api');
const Rethink = require("./lib/rethink");

const head = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
};
const aliveMsg = {ping: true};

const write = (writable, obj) => writable.write(`data: ${JSON.stringify(obj)}\n\n`);
const writeEvery = (timeout, writable, obj) => setInterval(() => write(writable, obj), timeout);

let toRethinkTableName = (name) => name.replace(".", "_dot_").replace("-", "_hyphen_");
let fromRethinkTableName = (name) => name.replace("_dot_", ".").replace("_hyphen_", "-");

const app = express();

app.get('/messages', (req, res) => {
    res.writeHead(200, head);

    let id = uuid();

    logger.info(`processing GET /messages for '${id}'`);

    const rethink = new Rethink({db: "topics"});
    rethink.connect()
        .then(() => {
            writeEvery(15000, res, aliveMsg);
            rethink.changes(
                {
                    table: toRethinkTableName("choreographer_dot_update_hyphen_merchant"),
                    limit: 20,
                    orderBy: 'offset',
                    onRow: (err, data) => {
                        if (!!err) {
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
            logger.error(err);
            res.connection.destroy();
            rethink.close();
        });

    req.on('close', () => {
        logger.info(`${id} connection closed`);
        rethink.close();
    });
});

app.get('/topics', (req, res) => {
    res.writeHead(200, head);

    let id = uuid();

    logger.info(`processing GET /topics for '${id}'`);

    const rethink = new Rethink({db: "rethinkdb"});
    rethink.connect()
        .then(() => {
            writeEvery(15000, res, aliveMsg);

            rethink.changes(
                {
                    table: "table_config",
                    onRow: (err, data) => {
                        if (!!err) {
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
            logger.error(err);
            res.connection.destroy();
            rethink.close();
        });

    req.on('close', () => {
        logger.info(`${id} connection closed`);
        rethink.close();
    });
});


let port = 3001;

app.listen(port, () => logger.info(`api listening on ${port}`));