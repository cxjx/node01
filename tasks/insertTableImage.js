const { db, pgp } = require('../utils/db');
const cfg = require('../config/config');

/* Multi-row insert */
function multi_insert (values, callback) {
  const cs = new pgp.helpers.ColumnSet([
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
  ], {table: cfg.IMAGE_TABLE_NAME}),
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

const insertTableImage = function (results, callback) {
    // // data input values:
    const values = results['convertAnalysisResults'];

    // insert multiple records via a transaction
    db.tx(t => {
      const queries = values.map(value => {
        return t.query(cfg.SQL_INSERT_INTO_ANALYSIS, value);
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

module.exports = insertTableImage;