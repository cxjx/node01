const { db } = require('../utils/db');
const cfg = require('../config/config');

const getDomainsFromDB = function (callback) {
  let domains = [];
  db.query(cfg.SQL_SELECT_FROM_DOMAIN)
    .then(data => {
      callback(null, data);
    })
    // .catch(err => {
    //   // callback(null, domains);
    //   callback(err||cfg.NOK);
    // });
}

module.exports = getDomainsFromDB;