// Proper way to initialize and share the Database object
const pgp = require('pg-promise')({
  // Initialization Options
  capSQL: true // capitalize all generated SQL
});
const cfg = require('../config/config');

// Creating a new database instance from the connection details:
const db = pgp(cfg.dbConnection);

// Exporting the database object for shared use:
module.exports = db;