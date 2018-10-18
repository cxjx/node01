const { db } = require('../utils/db');
const cfg = require('../config/config');

const getUrlsFromDB = function (callback) {
  db.query(cfg.SQL_SELECT_FROM_DOMAIN)
    .then(data => {
      callback(null, data);
    })
    .catch(err => {
      callback(err||cfg.NOK);
    });
}

module.exports = getUrlsFromDB;