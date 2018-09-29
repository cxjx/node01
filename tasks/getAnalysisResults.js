const async = require('async');
const _ = require('lodash');
const request = require('request');
const cfg = require('../config/config');

// {domainid: [imgurl01, imgurl02], domainid: [imgurl01, imgurl02]}
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