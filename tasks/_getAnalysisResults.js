const async = require('async');
const _ = require('lodash');
const request = require('request');
const cfg = require('../config/config');

// const input = {
//   id: 1,
//   url: 'http://letsdothis.com',
//   imageSrc: [ 'https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg' ],
// };
// output = {
//   id: 1,
//   url: 'http://letsdothis.com',
//   imageSrc: [ 'https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg' ],
//   result: '[{"https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg": {"Content": "0.428912", "Light": "0.231964", "MotionBlur": "0.0203646", "score": "0.730122", "VividColor": "0.493357", "Object": "0.122761", "Symmetry": "0.0761009", "DoF": "0.0578996", "ColorHarmony": "0.397761", "Repetition": "0.212869", "BalancingElement": "0.185691", "RuleOfThirds": "0.108831"}}]',
// };

const _getAnalysisResults = function (imageSrc, callback) {
  const url = cfg.analysisAPI;
  const data = {
    'standardize': 'True',
    'urls': imageSrc.imageSrc
  };

  const task = function (callback) {
    request.get({url: url, body: data, json: true}, (err, response, body) => {
      if (!err && response.statusCode == 200){
        callback(null, body);
      }else{
        callback(err||response.statusCode||cfg.NOK);
      }
    });
  }

  // try calling apiMethod 3 times
  async.retry(cfg.retryOpt, task, function(err, results) {
    // do something with the result
    if(err){
      callback(null, _.extend({}, imageSrc, {result: '[]'}));
    }else{
      callback(null, _.extend({}, imageSrc, results));
    }
  });
};

// test
// _getAnalysisResults(input, function(err, results){
//   console.log(results);
// });

module.exports = _getAnalysisResults;
