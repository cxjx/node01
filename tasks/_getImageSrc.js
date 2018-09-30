const async = require('async');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const scrape = require('website-scraper');
const images = require("images");
const cfg = require('../config/config');

// input = {id: 1, name: 'http://letsdothis.com'};
// output = {
//   id: 1,
//   name: 'http://letsdothis.com',
//   imageSrc: [ 'https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg' ],
// };
const _getImageSrc = function (domain, callback) {

  const task = function (callback) {
    let imageSrc = [];
    let directory = './tmp/' + domain.name.split('http://')[1];
    let options = _.extend({}, cfg.scapeOptions, {
      urls: domain.name,
      directory: directory,
      onResourceSaved: (resource) => {
        if(cfg.ImgReg.test(resource.filename)){
          console.log(process.cwd());
          const basePath = path.resolve(process.cwd(), directory);
          const fileName = path.join(basePath, resource.filename);
          const imgSize = images(fileName).size();

          if(Math.max(imgSize.width,imgSize.height) >= cfg.MinPixel){
            imageSrc.push(resource.url);
          }
        }
      },
    });

    fs.removeSync(directory);
    scrape(options, (err, data) => {
      if(err){
        callback(err);
      }else{
        if(imageSrc.length <= 0){
          callback(cfg.EMPTY);
        }else{
          callback(null, _.extend({}, domain, {imageSrc: imageSrc});
        }
      }
    });
  };

  // try calling apiMethod 3 times
  async.retry(cfg.retryOpt, task, function(err, results) {
    // do something with the result
    callback(err, results);
  });
};

module.exports = _getImageSrc;
