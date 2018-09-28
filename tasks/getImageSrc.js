const async = require('async');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const scrape = require('website-scraper');
const images = require("images");
const cfg = require('../config/config');

// cfg.MinPixel = 200;
// cfg.ImgReg = /\.(jpe?g)(\?.*)?/;

const getImageSrc = ['readDomains', 'removeScrapeDir', function (results, callback) {
  const domains = results.readDomains;

  let tasks = domains.reduce((result, domain) => {

    result[domain] = function(callback) {
      let imageUrls = [];
      let directory = './tmp/' + domain.split('http://')[1];

      let options = _.extend({}, cfg.scapeOptions, {
        urls: domain,
        directory: directory,
        onResourceSaved: (resource) => {
          console.log(`[${domain}] ${resource.filename}`);
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
          callback(err)
        }else{
          console.log(`-----------scrapeImagesUrls[${domain}]----------`, imageUrls);
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
    if(err){
      callback(err)
    }else{
      callback(null, results);
    }
  });
}];

function getImageSrc(callback) {
  // const domains = results.readDomains;
  const domains = [
    'http://letsdothis.com',
    'http://theathletic.com',
    // 'http://gamador.com',
    // 'http://physioh.com',
    // 'http://visor.gg',
    // 'http://writewith.com',
    // 'http://cognitionip.com',
    // 'http://scaleapi.com',
    // 'http://observantai.com',
    // 'http://boomsupersonic.com',
    // 'http://listia.com',
    // 'http://letshum.com',
    // 'http://volleythat.com',
    // 'http://arccameras.com',
    // 'http://dataform.co',
    // 'http://nebia.com',
    // 'http://chargehound.com',
    // 'http://assemblymade.com',
    // 'http://spellbrush.com',
    // 'http://aspire-cap.com',
    // 'http://tequitable.com',
    // 'http://minefold.com',
    // 'http://noorahealth.org',
    // 'http://buxfer.com',
    // 'http://groww.in',
    // 'http://simmery.com',
    // 'http://kimonolabs.com',
    // 'http://zyper.co',
    // 'http://codecademy.com',
    // 'http://taplytics.com',
    // 'http://tracksby.com',
    // 'http://solidstage.com',
    // 'http://ansibletechnologies.com',
    // 'http://archform.co',
    // 'http://lambdatea.com',
    // 'http://kirklandnorth.com',
    // 'http://fundersclub.com',
    // 'http://swayable.com',
    // 'http://snackpass.co',
    // 'http://sperofoods.co',
    // 'http://view3.com',
    // 'http://flytenow.com',
  ];
  let imageUrls = [];

  for (let i = domains.length - 1; i >= 0; i--) {
    let options = _.extend({}, cfg.scapeOptions, {
      urls: domains[i],
      onResourceSaved: (resource) => {
        console.log(`[${domains[i]}] ${resource.filename}`);
        if(cfg.ImgReg.test(resource.filename)){
          const basePath = path.resolve(process.cwd(), cfg.scapeOptions.directory);
          const fileName = path.join(basePath, resource.filename);
          const imgSize = images(fileName).size();

          if(Math.max(imgSize.width,imgSize.height) >= cfg.MinPixel){
            imageUrls.push(resource.url);
          }
        }
      },
    });

    fs.removeSync(cfg.scapeOptions.directory);
    scrape(options, (err, data) => {
      if(err){
        callback(err)
      }else{
        console.log(`-----------scrapeImagesUrls[${domains[i]}]----------`, imageUrls);
        if(imageUrls.length > 0){
          callback(null, imageUrls);
        }else{
          callback('Empty imageUrls');
        }
      }
    });
  }
  // const options = _.extend({}, cfg.scapeOptions, {
  //   urls: domains,
  //   onResourceSaved: (resource) => {
  //     console.log(resource.filename);
  //     if(cfg.ImgReg.test(resource.filename)){
  //       const basePath = path.resolve(process.cwd(), cfg.scapeOptions.directory);
  //       const fileName = path.join(basePath, resource.filename);
  //       const imgSize = images(fileName).size();

  //       if(Math.max(imgSize.width,imgSize.height) >= cfg.MinPixel){
  //         imageUrls.push(resource.url);
  //       }
  //     }
  //   },
  // });
  // scrape(options, (err, data) => {
  //   if(err){
  //     callback(err)
  //   }else{
  //     console.log('-----------scrapeImagesUrls----------', imageUrls);
  //     if(imageUrls.length > 0){
  //       callback(null, imageUrls);
  //     }else{
  //       callback('Empty imageUrls');
  //     }
  //   }
  // });
}

function _getImageSrc(domain, callback) {
  // const domains = results.readDomains;
  const domains = [
    'http://letsdothis.com',
    'http://theathletic.com',
  ];
  let imageUrls = [];
  for (let i = domains.length - 1; i >= 0; i--) {
    let options = _.extend({}, cfg.scapeOptions, {
      urls: domains[i],
      onResourceSaved: (resource) => {
        console.log(`[${domains[i]}] ${resource.filename}`);
        if(cfg.ImgReg.test(resource.filename)){
          const basePath = path.resolve(process.cwd(), cfg.scapeOptions.directory);
          const fileName = path.join(basePath, resource.filename);
          const imgSize = images(fileName).size();

          if(Math.max(imgSize.width,imgSize.height) >= cfg.MinPixel){
            imageUrls.push(resource.url);
          }
        }
      },
    });

    fs.removeSync(cfg.scapeOptions.directory);
    scrape(options, (err, data) => {
      if(err){
        callback(err)
      }else{
        console.log(`-----------scrapeImagesUrls[${domains[i]}]----------`, imageUrls);
        if(imageUrls.length > 0){
          callback(null, imageUrls);
        }else{
          callback('Empty imageUrls');
        }
      }
    });
  }
}

module.exports = getImageSrc;
// // an example using an object instead of an array
// async.parallel({
//   one: function(callback) {
//     setTimeout(function() {
//       callback(null, 1);
//     }, 200);
//   },
//   two: function(callback) {
//     setTimeout(function() {
//       callback(null, 2);
//     }, 100);
//   }
// }, function(err, results) {
//   // results is now equals to: {one: 1, two: 2}
// });
