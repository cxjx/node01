const request = require('request');
const cfg = require('../config/config');

const getAnalysisResults = function (results, callback) {
  const url = cfg.analysisAPI;
  const imageUrls = results.scrapeImagesUrls;

  request.get({url: url, body: imageUrls, json: true}, (err, response, body) => {
    if (!err && response.statusCode == 200){
      callback(null, body);
    }else{
      callback(err||response.statusCode||cfg.NOK);
    }
  });
};

module.exports = getAnalysisResults;