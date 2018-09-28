const { db } = require('../utils/db');
const cfg = require('../config/config');

const initTables = function (callback) {
  db.task('initTables', t => {
    // execute a chain of queries against the task context, and return the result:
    return t.none(cfg.SQL_CREATE_TABLE_DOMAIN).then(() => {
      return t.none(cfg.SQL_CREATE_TABLE_ANALYSIS).then(() => {
        return 'sucess';
      });
    });
  })
    .then(data => {
      callback(null, cfg.OK);
    })
    .catch(err => {
      callback(err||cfg.NOK);
    });
}

module.exports = initTables;