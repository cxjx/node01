const async = require('async');
const request = require('request');
const cfg = require('../config/config');

const getResults = function (urls, callback) {
  const api = cfg.analysisAPI;
  const data = {
    'standardize': 'True',
    'urls': urls.map(e => e.url),
  };

  const task = function (callback) {
    request.get({url: api, body: data, json: true}, (err, response, body) => {
      if (!err && response.statusCode == 200){
        callback(null, body);
      }else{
        console.log(urls.map(e => e.id), err);
        callback(err||response.statusCode||cfg.NOK);
      }
    });
  }

  // try calling apiMethod 3 times
  async.retry(cfg.retryOpt, task, function(err, results) {
    // do something with the result
    if(err){
      callback(null, {result: '[]'});
    }else{
      callback(null, results);
    }
  });
};

module.exports = getResults;
