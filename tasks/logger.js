const cfg = require('../config/config');
const logger = require('log4js').getLogger();
logger.level = cfg.logLevel;

module.exports = logger;
