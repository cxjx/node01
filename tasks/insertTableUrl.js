const { db, pgp } = require('../utils/db');
const cfg = require('../config/config');

/* Multi-row insert */
function multi_insert (values, callback) {
  const cs = new pgp.helpers.ColumnSet(['name'], {table: cfg.URL_TABLE_NAME});
  // generating a multi-row insert query:
  const query = pgp.helpers.insert(values, cs);
  // executing the query:
  db.none(query)
    .then(data => {
      callback(null, cfg.OK);
    })
    .catch(err => {
      callback(err||cfg.NOK);
    });
};

const insertTableUrl = function (values, callback) {
  // insert multiple records via a transaction
  db.tx(t => {
    const queries = values.map(value => {
      return t.query(cfg.SQL_INSERT_INTO_DOMAIN, value);
    });
    return t.batch(queries);
  })
    .then(data => {
      callback(null, cfg.OK);
    })
    .catch(err => {
      callback(err||cfg.NOK);
    });
};

module.exports = insertTableUrl;