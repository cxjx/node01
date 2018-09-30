const { db, pgp, cs_image } = require('../utils/db');
const cfg = require('../config/config');

// input = [
//   {
//     "urlid": '1',
//     "imgurl": "https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg",
//     "Content": "0.428912",
//     "Light": "0.231964",
//     "MotionBlur": "0.0203646",
//     "score": "0.730122",
//     "VividColor": "0.493357",
//     "Object": "0.122761",
//     "Symmetry": "0.0761009",
//     "DoF": "0.0578996",
//     "ColorHarmony": "0.397761",
//     "Repetition": "0.212869",
//     "BalancingElement": "0.185691",
//     "RuleOfThirds": "0.108831"
//   }
// ];

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

const _insertTableImage = function (values, callback) {
    // insert multiple records via a transaction
    db.tx(t => {
      const queries = values.map(value => {
        return t.query(cfg.SQL_INSERT_INTO_ANALYSIS, value);
      });
      return t.batch(queries);
    })
      .then(data => {
        callback(null, values);
      })
      .catch(err => {
        callback(err||cfg.NOK);
      });
  };

module.exports = _insertTableImage;