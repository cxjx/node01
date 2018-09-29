const async = require('async');

const cfg = require('../config/config');
const _getImageSrc = require('./getImageSrc');
const _getAnalysisResults = require('./getAnalysisResults');
const _insertTableImage = require('./insertTableImage');

// input = [
//   {id: 1, name: 'http://letsdothis.com'},
//   {id: 2, name: 'http://theathletic.com'}
// ];
// output = 

const _run = function (domains, callback_auto) {

  let tasks = domains.map( domain => {
    return function (callback_parallel) {

      async.auto({
        getImageSrc: function (callback) {
          // [{id: 1, name: 'http://letsdothis.com'}]
          _getImageSrc([domain], callback);
        },
        getAnalysisResults: ['getImageSrc', function (callback) {
          // {'1': ['https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg']}
          const imageUrls = results.getImageSrc;

          _getAnalysisResults(imageUrls, callback);
        }],
        insertTableImage: ['getAnalysisResults', function () {
          const values = [];
          const res = results.getAnalysisResults;
          const ids = Object.keys(res);
          ids.forEach(id => {
            let data = JSON.parse(res[id].result);
            data = data.map(o => {
              for(let k in o){
                return Object.assign({urlid: id, imgurl: k}, o[k])
              }
            });
            values.push(...data);
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
          callback_parallel(err||cfg.NOK);
        }else{
          console.log(`${domain} DONE, ${results.insertTableImage}`);
          callback_parallel(null, results);
        }
      });

    };
  });

  async.parallelLimit(tasks, cfg.asyncParalelLimit, function(err, results) {
    // results is now equal to ['one', 'two']
    if(err){
      callback_auto(err||cfg.NOK);
    }else{
      callback_auto(null, results);
    }
  });


};

module.exports = _run;
