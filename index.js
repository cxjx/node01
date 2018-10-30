require('events').EventEmitter.defaultMaxListeners = 100;
const _ = require('lodash');
const async = require('async');
const express = require('express');

const cfg = require('./config/config');
const _getUrls = require('./tasks/getUrls');
const _getResults = require('./tasks/getResults');

const app = express();
// url=xxx&pixel=num
app.get('/evaluation', function(req, res){
  console.log(req.query);
  const url = req.query.url;
  const pixel = req.query.pixel || cfg.minPixel;

  async.auto({
    getUrls: function (callback) {
      const domain = {
        url: url,
        pixel: pixel,
      };

      _getUrls(domain, callback);
    },
    getResults: ['getUrls', function (results, callback) {
      const urls = results.getUrls.imageSrc;

      if(urls.length == 0){
        callback(cfg.EMPTY);
      }else{
        _getResults(urls, callback);
      }
    }],
  },
  function(err, results) {
    if(err){
      res.send('error');
    }else{
      const data = JSON.parse(results.getResults.result);

      let dataArr = [];
      data.forEach(function(o){
        dataArr = dataArr.concat(Object.values(o));
      });

      const r = {};
      for(let k in dataArr[0]){
        let mean = _.meanBy(dataArr, function(o){return parseFloat(o[k])});
        r[k] = mean.toFixed(7);
      }
      r['totalImages'] = data.length;

      const result = {};
      result[url] = r;
      res.send(result);
    }
  });
});

app.listen(3000);
