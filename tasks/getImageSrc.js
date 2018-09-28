const async = require('async');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const scrape = require('website-scraper');
const images = require("images");
const cfg = require('../config/config');

// cfg.MinPixel = 200;
// cfg.ImgReg = /\.(jpe?g)(\?.*)?/;
const getImageSrc = function (domains, callback) {

  let tasks = domains.reduce((task, domain) => {

    task[domain.id] = function(callback) {
      let imageUrls = [];
      let directory = './tmp/' + domain.name.split('http://')[1];

      let options = _.extend({}, cfg.scapeOptions, {
        urls: domain.name,
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
          // console.log(`-----------${domain.name}----------`, imageUrls);
          if(imageUrls.length > 0){
            callback(null, imageUrls);
          }else{
            callback(cfg.EMPTY);
          }
        }
      });
    };

    return task;
  },{});

  async.parallel(tasks, function(err, results) {
    if(err){
      callback(err||cfg.NOK);
    }else{
      callback(null, results);
    }
  });
};

module.exports = getImageSrc;
