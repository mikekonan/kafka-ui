const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../lib/logger')('api');
const Rethink = require("../lib/rethink");

const connStore = {};

const head = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
};

const write = (writable, obj) => writable.write(`data: ${JSON.stringify(obj)}\n\n`);

const app = express();

let mock = {
    "at": "Sun Dec 22 2019 09:35:55 GMT+00:00",
    "headers": [
        {
            "x-choreographer-event": "ChoreographerStepStarted"
        },
        {
            "x-choreographer-saga-id": "d9ecdf8c-4327-4fa5-8214-0bebc4c40c3f"
        },
        {
            "merchant-id": "7a7dc7ee-6087-46cd-97a2-95d3e7252946"
        },
        {
            "x-choreographer-step-id": "start"
        },
        {
            "x-choreographer-append-context": "id=>merchant.id;title=>merchant.title;"
        }
    ],
    "id": "11151344-916d-40c3-9330-e0d41de1164a",
    "offset": 1055,
    "partition": 0,
    "payload": {
        "data": {
            "merchant": {
                "id": "7a7dc7ee-6087-46cd-97a2-95d3e7252946",
                "title": "newTitle",
                "array": ["1", "2"],
                "adsa": {"das": ['dsada'], "zzz": {"zzz": "aaa", "bbb": "qqqq"}},
                "adsaa": {"das": ['dsada'], "zzz": {"zzz": "aaa", "bbb": "qqqq"}}
            }
        }
    },
    "size": 86,
    "timestamp": 1577007355930,
    "topic": "choreographer.update-merchant"
};

let toRethinkTableName = (name) => name.replace(".", "_dot_").replace("-", "_hyphen_");
let fromRethinkTableName = (name) => name.replace("_dot_", ".").replace("_hyphen_", "-");

app.get('/messages', (req, res) => {
    res.writeHead(200, head);

    let id = uuid();

    logger.info(`processing GET /messages for '${id}'`);
    connStore[id] = res;

    const rethink = new Rethink({db: "topics"});
    rethink.connect()
        .then(() => rethink.changes(
            {
                table: toRethinkTableName("choreographer_dot_update_hyphen_merchant"),
                limit: 20,
                orderBy: 'offset',
                onRow: (err, data) => {
                    if (!!err) {
                        res.connection.destroy();
                        rethink.close();
                        return
                    }

                    write(res, data['new_val']);
                }
            }))
        .catch(err => {
            logger.error(err);
            res.connection.destroy();
            rethink.close();
        });

    req.on('close', () => {
        logger.info(`${id} connection closed`);
        rethink.close();
        connStore[id] = undefined;
    });
});

app.get('/topics', (req, res) => {
    res.writeHead(200, head);

    let id = uuid();

    logger.info(`processing GET /topics for '${id}'`);
    connStore[id] = res;

    const rethink = new Rethink({db: "rethinkdb"});
    rethink.connect()
        .then(() => rethink.changes(
            {
                table: "table_config",
                onRow: (err, data) => {
                    if (!!err) {
                        res.connection.destroy();
                        rethink.close();
                        return
                    }

                    if (data['new_val'].db === "topics") {
                        write(res, {topic: fromRethinkTableName(data['new_val'].name)});
                    }
                }
            }))
        .catch(err => {
            logger.error(err);
            res.connection.destroy();
            rethink.close();
        });

    req.on('close', () => {
        logger.info(`${id} connection closed`);
        rethink.close();
        connStore[id] = undefined;
    });
});


let port = 3001;

app.listen(port, () => logger.info(`api listening on ${port}`));