// Proper way to initialize and share the Database object
const pgp = require('pg-promise')({
  // Initialization Options
  capSQL: true // capitalize all generated SQL
});
const cfg = require('../config/config');

// Creating a new database instance from the connection details:
const db = pgp(cfg.dbConnection);

const cs_url = new pgp.helpers.ColumnSet([
  'provider_id',
  'provider_status',
  'shoottype',
  'url',
], {table: cfg.URL_TABLE_NAME});
const cs_image = new pgp.helpers.ColumnSet([
  'url_id',
  'motion_blur',
  'light',
  'color_harmony',
  'symmetry',
  'vivid_color',
  'repetition',
  'content',
  'do_f',
  'object',
  'rule_of_thirds',
  'balancing_element',
  'score',
], {table: cfg.IMAGE_TABLE_NAME});

// Exporting the database object for shared use:
module.exports.db = db;
module.exports.pgp = pgp;
module.exports.cs_url = cs_url;
module.exports.cs_image = cs_image;