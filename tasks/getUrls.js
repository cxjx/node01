const async = require('async');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const scrape = require('website-scraper');
const getImageUrls = require('../get-image-urls');
// const images = require("images");
const probe = require('probe-image-size');
const cfg = require('../config/config');
const logger = require('./logger');

// input = {id: 1, url: 'http://letsdothis.com'};
// output = {
//   id: 1,
//   url: 'http://letsdothis.com',
//   imageSrc: [ 'https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg' ],
// };
const _getImageSrc = function (domain, callback) {

  const task = function (callback) {
    let ps = [];
    let imageSrc = [];
    let url = /(https?:)/.test(domain.url) ? domain.url : 'http://'+domain.url;
    let minPixel = domain.pixel;

    if(domain.method == 1){
      let directory = './tmp/' + domain.url;
      let options = _.extend({}, cfg.scapeOptions, {
        urls: url,
        directory: directory,
        resourceSaver: class MyResourceSaver {
          saveResource (resource) {/* code to save file where you need */
            if(cfg.imgReg.test(resource.filename)){
              // ps.push(probe(resource.url));
              let result = probe.sync(new Buffer(resource.text, 'binary'));
              if(Math.max(result.width, result.height) >= minPixel){
                // console.log(resource.url);
                imageSrc.push(resource.url);
              }
            }
          }
          errorCleanup (err) {/* code to remove all previously saved files in case of error */
            console.log(err);
          }
        },
      });
      scrape(options, (err, data) => {
        if(err){
          callback(err);
        }else{
          if(imageSrc.length <= 0){
            callback(cfg.EMPTY);
          }else{
            callback(null, imageSrc);
          }
        }
      });
    }else{
      getImageUrls(url)
      .then(function(images) {
        logger.debug(`totalImages[all]: ${images.length}`);
        logger.debug(`totalImages[all:onResourceRequested]: ${images.filter(image => image.contentType == 'onResourceRequested').length}`);
        logger.debug(`totalImages[all:onResourceTimeout]: ${images.filter(image => image.contentType == 'onResourceTimeout').length}`);

        images = images.filter(image => cfg.imgReg.test(image.url));
        logger.debug(`totalImages[type]: ${images.length}`);

        images = _.uniqBy(images, 'url');
        logger.debug(`totalImages[uniq]: ${images.length}`);

        const startTime = +new Date();
        images.forEach(image => {
          ps.push(probe(image.url));
        });
        Promise.all(ps.map(p => {
          return p.catch(err => [{err:err}][0]);
        })).then(results => {
          const endTime = +new Date();
          logger.info(`getImgSize[${domain.url}]: ${endTime-startTime}ms`);
          results.forEach(result => {
            if(Math.max(result.width, result.height) >= minPixel){
              imageSrc.push(result.url);
            }
          });
          logger.debug(`totalImages[size]: ${imageSrc.length}`);
          if(imageSrc.length <= 0){
            callback(cfg.EMPTY);
          }else{
            callback(null, imageSrc);
          }
        }).catch(err => {
          callback(err);
        });

        // async.parallel(ps.map(promise => {
        //   return function (callback) {
        //     promise.then(result => {
        //       callback(null, result);
        //     }).catch(error => {
        //       callback(null, {width:0,height:0});
        //     })
        //   }
        // }),
        // function(err, results) {
        //   results.forEach(result => {
        //       console.log(result.width);
        //     if(Math.max(result.width, result.height) >= minPixel){
        //       imageSrc.push(result.url);
        //     }
        //   });
        //   if(imageSrc.length <= 0){
        //     callback(cfg.EMPTY);
        //   }else{
        //     callback(null, imageSrc);
        //   }
        // });
      })
      .catch(function(err) {
        callback(err);
      });
    }
  };

  // try calling apiMethod 3 times
  async.retry(cfg.retryOpt, task, function(err, results) {
    // do something with the result
    if(err){
      err != cfg.EMPTY && logger.error(err);
      callback(null, _.extend({}, domain, {imageSrc: []}));
    }else{
      callback(null, _.extend({}, domain, {imageSrc: results}));
    }
  });
};

module.exports = _getImageSrc;
