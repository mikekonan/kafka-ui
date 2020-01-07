const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../lib/logger')('api');

const connStore = {};

const head = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
};

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

app.get('/messages', (req, res) => {
    res.writeHead(200, head);

    let id = uuid();

    logger.info(`processing GET /messages for '${id}'`);
    connStore[id] = res;

    (function theLoop() {
        setTimeout(() => {
            mock.offset++;
            res.write(`data: ${JSON.stringify(mock)}\n\n`);
            theLoop()
        }, 2500);
    })();

    req.on('close', () => {
        logger.info(`${id} connection closed`);
        connStore[id] = undefined;
    });
});

app.get('/topics', (req, res) => {
    res.writeHead(200, head);

    let id = uuid();

    logger.info(`processing GET /topics for '${id}'`);
    connStore[id] = res;

    let obj = {topic: 'topic1'};
    let obj2 = {topic: 'topic2'};

    res.write(`data: ${JSON.stringify(obj)}\n\n`);
    res.write(`data: ${JSON.stringify(obj2)}\n\n`);

    req.on('close', () => {
        logger.info(`${id} connection closed`);
        connStore[id] = undefined;
    });
});


let port = 3001;

app.listen(port, () => logger.info(`api listening on ${port}`));

