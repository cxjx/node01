const _ = require('lodash');
const async = require('async');

// const _run = function (domains, callback) {

//   let tasks = domains.map( domain => {
//     return function (callback) {
//       async.auto({
//         getImageSrc: function (callback) {
//           // domain = {
//           //   id: 1,
//           //   url: 'http://letsdothis.com',
//           // };
//           _getImageSrc(domain, callback);
//         },
//         getAnalysisResults: ['getImageSrc', function (results, callback) {
//           // imageSrc = {
//           //   id: 1,
//           //   url: 'http://letsdothis.com',
//           //   imageSrc: [ 'https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg' ],
//           // };
//           const imageSrc = results.getImageSrc;

//           if(imageSrc.imageSrc.length > 0){
//             _getAnalysisResults(imageSrc, callback);
//           }else{
//             callback(null, cfg.EMPTY);
//           }
//         }],
//         insertTableImage: ['getAnalysisResults', function (results, callback) {
//           // res = {
//           //   id: 1,
//           //   url: 'http://letsdothis.com',
//           //   imageSrc: [ 'https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg' ],
//           //   result: '[{"https://d178fu9mi2dmkb.cloudfront.net/webapp-media/images/logo-social.jpg": {"Content": "0.428912", "Light": "0.231964", "MotionBlur": "0.0203646", "score": "0.730122", "VividColor": "0.493357", "Object": "0.122761", "Symmetry": "0.0761009", "DoF": "0.0578996", "ColorHarmony": "0.397761", "Repetition": "0.212869", "BalancingElement": "0.185691", "RuleOfThirds": "0.108831"}}]',
//           // };
//           const res = results.getAnalysisResults;
//           if(res === cfg.EMPTY){
//             callback(null, cfg.EMPTY);
//           }else{
//             const urlid = res.id;
//             const data = JSON.parse(res.result);
//             const values = data.map(o => {
//               for(let k in o){
//                 let _o = o[k];
//                 let out = {};
//                 for(let _k in _o){
//                   out[(_k.slice(0,1).toLowerCase()+_k.slice(1)).replace(/([A-Z])/g,"_$1").toLowerCase()] = _o[_k];
//                 }
//                 return _.extend({}, {urlid: 1, imgurl: k}, out);
//               }
//             });
//             if(values.length > 0){
//               _insertTableImage(values, callback)
//             }else{
//               callback(null, cfg.EMPTY);
//             }
//           }
//         }],
//       },
//       function(err, results) {
//         // results is now equal to {'one': 1, 'two': 2}
//         if(err){
//           callback(err||cfg.NOK);
//         }else{
//           console.log(`[${domain.id}|${domain.url}] DONE: ${JSON.stringify(results.insertTableImage)}`);
//           callback(null, results);
//         }
//       });
//     };
//   });

//   async.parallelLimit(tasks, cfg.asyncParalelLimit, function(err, results) {
//     // results is now equal to ['one', 'two']
//     if(err){
//       callback(err||cfg.NOK);
//     }else{
//       callback(null, results);
//     }
//   });
// };

// module.exports = _run;

const values = Array.from({length:12}, (v,k) => 'task'+k);
const tasks = _.chunk(values, 5);
console.log(tasks);

// create a queue object with concurrency 2
var q = async.queue(function(task, callback) {
    console.log('hello ' + task.name);
    callback();
}, 2);

// assign a callback
q.drain = function() {
    console.log('all items have been processed');
};

// add some items to the queue
q.push({name: 'foo'}, function(err) {
    console.log('finished processing foo');
});
q.push({name: 'bar'}, function (err) {
    console.log('finished processing bar');
});

// add some items to the queue (batch-wise)
q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
    console.log('finished processing item');
});

// add some items to the front of the queue
q.unshift({name: 'bar'}, function (err) {
    console.log('finished processing bar');
});