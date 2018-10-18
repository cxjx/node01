const { db, pgp, cs_image } = require('../utils/db');
const cfg = require('../config/config');

/* Multi-row insert */
function multi_insert (values, callback) {
  // generating a multi-row insert query:
  const query = pgp.helpers.insert(values, cs_image);
  // executing the query:
  db.none(query)
    .then(data => {
      callback(null, cfg.OK);
    })
    .catch(err => {
      callback(err||cfg.NOK);
    });
};

const setResultsToDB = function (values, callback) {
  // insert multiple records via a transaction
  db.tx(t => {
    const queries = values.map(value => {
      return t.query(cfg.SQL_INSERT_INTO_ANALYSIS, value);
    });
    return t.batch(queries);
  })
    .then(data => {
      callback(null, data);
    })
    .catch(err => {
      callback(err||cfg.NOK);
    });
};

module.exports = setResultsToDB;