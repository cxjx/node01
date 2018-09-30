const async = require('async');
const _ = require('lodash');
const cfg = require('../config/config');
const _getImageSrc = require('./_getImageSrc');
const _getAnalysisResults = require('./_getAnalysisResults');
const _insertTableImage = require('./_insertTableImage');

// input = [
//   {id: 1, name: 'http://letsdothis.com'},
//   {id: 2, name: 'http://theathletic.com'}
// ];
// output = [
//   {
//     getImageSrc: [Object],
//     getAnalysisResults: [Object],
//     insertTableImage: 'isEmptyArray'
//   },
//   {
//     getImageSrc: [Object],
//     getAnalysisResults: [Object],
//     insertTableImage: [Array]
//   }
// ];

const _run = function (domains, callback) {

  let tasks = domains.map( domain => {
    return function (callback) {
      async.auto({
        getImageSrc: function (callback) {
          // domain = {
          //   id: 1,
          //   name: 'http://letsdothis.com',
          // };
          _getImageSrc(domain, callback);
        },
        getAnalysisResults: ['getImageSrc', function (results, callback) {
          // imageSrc = {
          //   id: 1,
          //   name: 'http://letsdothis.com',
          //   imageSrc: [ 'https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg' ],
          // };
          const imageSrc = results.getImageSrc;

          if(imageSrc.imageSrc.length > 0){
            _getAnalysisResults(imageSrc, callback);
          }else{
            callback(null, cfg.EMPTY);
          }
        }],
        insertTableImage: ['getAnalysisResults', function (results, callback) {
          // res = {
          //   id: 1,
          //   name: 'http://letsdothis.com',
          //   imageSrc: [ 'https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg' ],
          //   result: '[{"https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg": {"Content": "0.428912", "Light": "0.231964", "MotionBlur": "0.0203646", "score": "0.730122", "VividColor": "0.493357", "Object": "0.122761", "Symmetry": "0.0761009", "DoF": "0.0578996", "ColorHarmony": "0.397761", "Repetition": "0.212869", "BalancingElement": "0.185691", "RuleOfThirds": "0.108831"}}]',
          // };
          const res = results.getAnalysisResults;
          const urlid = res.id;
          const data = JSON.parse(res.result);
          const values = data.map(o => {
            for(let k in o){
              return _.extend({}, {urlid: urlid, imgurl: k}, o[k]);
            }
          });

          if(values.length > 0){
            _insertTableImage(values, callback)
          }else{
            callback(null, cfg.EMPTY);
          }
        }],
      },
      function(err, results) {
        // results is now equal to {'one': 1, 'two': 2}
        if(err){
          callback(err||cfg.NOK);
        }else{
          console.log(`[${domain.id}|${domain.name}] DONE: ${JSON.stringify(results.insertTableImage)}`);
          callback(null, results);
        }
      });
    };
  });

  async.parallelLimit(tasks, cfg.asyncParalelLimit, function(err, results) {
    // results is now equal to ['one', 'two']
    if(err){
      callback(err||cfg.NOK);
    }else{
      callback(null, results);
    }
  });
};

module.exports = _run;
