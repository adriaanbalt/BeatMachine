var winston = require('winston');

function getLogLocation() {
    switch(process.env.NODE_ENV){
	case 'development':
	case 'production':
	    return '/var/log';
    }
    return __dirname;
}

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: getLogLocation() + '/beatmachine.debug.log', json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true })
    //new winston.transports.File({ filename: getLogLocation() + '/beatmachine.exceptions.log', json: false })
  ],
  exitOnError: false
});

module.exports = logger;
