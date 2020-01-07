const log4js = require('log4js');

log4js.configure({
    appenders: {
        out: {
            type: 'stdout', layout: {
                type: 'pattern',
                pattern: '%[[%d] [%p] [%c] [%m] [%f{2}:%l]%]%n'
            }
        }
    },

    categories: {
        default: {
            appenders: ['out'],
            level: 'debug',
            // level: 'info',
            enableCallStack: true
        }
    }
});


module.exports = (scope) => log4js.getLogger(scope);