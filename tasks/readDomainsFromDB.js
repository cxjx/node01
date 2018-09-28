const { db } = require('../utils/db');
const cfg = require('../config/config');

const readDomainsFromDB = function (results, callback) {
  let domains = [];
  db.query(cfg.SQL_SELECT_FROM_DOMAIN)
    .then(data => {
      // console.log(data);
      domains = data.map( domain => domain.name);
      callback(null, domains);
    }).catch(err => {
      callback(null, domains);
    });
}

module.exports = readDomainsFromDB;