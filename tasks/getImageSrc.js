const async = require('async');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const scrape = require('website-scraper');
const images = require("images");
const cfg = require('../config/config');

// cfg.MinPixel = 200;
// cfg.ImgReg = /\.(jpe?g)(\?.*)?/;
// const getImageSrc = ['readDomains', 'removeScrapeDir', function (results, callback) {}];
const getImageSrc = function (results, callback) {
  const domains = results.readDomains;

  let tasks = domains.reduce((result, domain) => {

    result[domain] = function(callback) {
      let imageUrls = [];
      let directory = './tmp/' + domain.split('http://')[1];

      let options = _.extend({}, cfg.scapeOptions, {
        urls: domain,
        directory: directory,
        onResourceSaved: (resource) => {
          if(cfg.ImgReg.test(resource.filename)){
            const basePath = path.resolve(process.cwd(), directory);
            const fileName = path.join(basePath, resource.filename);
            const imgSize = images(fileName).size();

            if(Math.max(imgSize.width,imgSize.height) >= cfg.MinPixel){
              imageUrls.push(resource.url);
            }
          }
        },
      });

      fs.removeSync(directory);
      scrape(options, (err, data) => {
        if(err){
          callback(err);
        }else{
          console.log(`-----------${domain}----------`, imageUrls);
          if(imageUrls.length > 0){
            callback(null, imageUrls);
          }else{
            callback('imageUrls is empty');
          }
        }
      });
    };

    return result;
  },{});

  async.parallel(tasks, function(err, results) {
    // console.log(results);
    if(err){
      callback(err||cfg.NOK);
    }else{
      callback(null, results);
    }
  });
};

module.exports = getImageSrc;
