const async = require('async');
const _ = require('lodash');
const request = require('request');
const cfg = require('../config/config');

// input = {
//   '1': [ 'https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg' ],
//   '2': [ 'https://s3-us-west-2.amazonaws.com/theathletic-promos/homepage/stadium-crowd-mobile.jpg' ]
// };
// output = {
//   '1': { result: '[{"https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg": {"Content": "0.428912", "Light": "0.231964", "MotionBlur": "0.0203646", "score": "0.730122", "VividColor": "0.493357", "Object": "0.122761", "Symmetry": "0.0761009", "DoF": "0.0578996", "ColorHarmony": "0.397761", "Repetition": "0.212869", "BalancingElement": "0.185691", "RuleOfThirds": "0.108831"}}]' },
//   '2': { result: '[{"https://s3-us-west-2.amazonaws.com/theathletic-promos/homepage/stadium-crowd-mobile.jpg": {"Content": "-0.342356", "Light": "-0.348781", "MotionBlur": "-0.0443438", "score": "0.341835", "VividColor": "-0.411841", "Object": "-0.434923", "Symmetry": "0.0912129", "DoF": "-0.133214", "ColorHarmony": "-0.0638494", "Repetition": "0.218895", "BalancingElement": "-0.0652886", "RuleOfThirds": "-0.0110967"}}]' }
// };

const getAnalysisResults = function (imageUrls, callback) {
  const url = cfg.analysisAPI;

  let tasks = _.mapValues(imageUrls, (value, key) => {
    return function (callback) {
      request.get({url: url, body: value, json: true}, (err, response, body) => {
        if (!err && response.statusCode == 200){
          callback(null, body);
        }else{
          callback(err||response.statusCode||cfg.NOK);
        }
      });
    }
  });

  async.parallelLimit(tasks, cfg.asyncParalelLimit, function(err, results) {
    if(err){
      callback(err||cfg.NOK);
    }else{
      callback(null, results);
    }
  });
};

module.exports = getAnalysisResults;