require('events').EventEmitter.defaultMaxListeners = 100;
const _ = require('lodash');
const async = require('async');
const express = require('express');
const bodyParser = require('body-parser');

const cfg = require('./config/config');
const _getUrls = require('./tasks/getUrls');
const _getResults = require('./tasks/getResults');

const app = express();
app.use(bodyParser.json());

app.get('/evaluation', function(req, res){
  // url=xxx&pixel=num
  console.log(req.query);
  handler(req.query, res);
});
app.post("/evaluation", function(req,res){
  // res.json(req.body);
  console.log(req.body);
  handler(req.body, res);
});

function handler(req, res) {
  const url = req.url;
  const pixel = req.pixel || cfg.minPixel;

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
    const result = {
      url: url,
      totalImages: 0,
    };
    if(err){
      if(err == cfg.EMPTY){
        res.send(result);
      }else{
        res.status(500).send(err);
      }
    }else{
      const data = JSON.parse(results.getResults.result);

      let dataArr = [];
      data.forEach(function(o){
        dataArr = dataArr.concat(Object.values(o));
      });

      for(let k in dataArr[0]){
        let mean = _.meanBy(dataArr, function(o){return parseFloat(o[k])});
        result[k] = mean.toFixed(7);
      }

      result.totalImages = data.length;
      res.send([result]);
    }
  });
}

app.listen(3000);
