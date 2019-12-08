const {Signale} = require('signale');
const stackTrace = require('stack-trace');

const buildMsg = (msg, stringify) => {
    const trace = stackTrace.get()[2];
    const loggable = {
        location: `${trace.getFileName()}:${trace.getFunctionName()}:${trace.getLineNumber()}:${trace.getColumnNumber()}`,
    };

    if (typeof msg === 'object') {
        Object.keys(msg).forEach(k => {
            loggable[k] = msg[k];
        });
    } else {
        loggable.message = !!!msg ? '' : msg.toString()
    }

    return JSON.stringify(loggable);
};

module.exports = function (scope) {
    const options = {
        disabled: false,
        interactive: false,
        logLevel: 'info',
        scope: scope,
        secrets: [],
        stream: process.stdout,
        types: {
            msg: {
                badge: '📨',
                color: 'yellow',
                label: 'message',
                logLevel: 'debug'
            },
            msgErr: {
                badge: '🚫',
                color: 'red',
                label: 'wrong-message',
                logLevel: 'warn'
            },
            info: {
                badge: 'ℹ️',
                color: 'blue',
                label: 'info',
                logLevel: 'info'
            },
            warn: {
                badge: '⚠️',
                color: 'red',
                label: 'warning',
                logLevel: 'warn'
            },
            fatal: {
                badge: '🔥',
                color: 'red',
                label: 'fatal',
                logLevel: 'fatal'
            },
            error: {
                badge: '❌',
                color: 'red',
                label: 'error',
                logLevel: 'error'
            },

        }
    };

    const logger = new Signale(options);


    this.info = (msg) => logger.info(buildMsg(msg));
    this.msg = (msg) => logger.msg(buildMsg(msg, true));
    this.warn = (msg) => logger.warn(buildMsg(msg));
    this.error = (msg) => logger.error(buildMsg(msg));

    this.msgErr = (msg) => {
        logger.msgErr(buildMsg(msg, true))
    };

    this.fatal = (msg) => {
        logger.fatal(buildMsg(msg));
        process.exit(1);
    };

    return this;
};