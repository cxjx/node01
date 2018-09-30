// Proper way to initialize and share the Database object
const pgp = require('pg-promise')({
  // Initialization Options
  capSQL: true // capitalize all generated SQL
});
const cfg = require('../config/config');

// Creating a new database instance from the connection details:
const db = pgp(cfg.dbConnection);


const cs_url = new pgp.helpers.ColumnSet(['name'], {table: cfg.URL_TABLE_NAME});
const cs_image = new pgp.helpers.ColumnSet([
  'imgurl',
  'MotionBlur',
  'Light',
  'ColorHarmony',
  'Symmetry',
  'VividColor',
  'Repetition',
  'Content',
  'DoF',
  'Object',
  'RuleOfThirds',
  'BalancingElement',
  'score',
], {table: cfg.IMAGE_TABLE_NAME});

// Exporting the database object for shared use:
module.exports.db = db;
module.exports.pgp = pgp;
module.exports.cs_url = cs_url;
module.exports.cs_image = cs_image;