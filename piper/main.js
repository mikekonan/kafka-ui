const logger = require('./logger')('main');
const Consumer = require("./consumer");

let consumer = new Consumer();

consumer.on('data', (msg) => {
    if (!!msg.error) {
        logger.msgErr(msg);
        return
    }

    logger.msg(msg);
});