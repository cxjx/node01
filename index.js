require('events').EventEmitter.defaultMaxListeners = 100;
const _ = require('lodash');
const async = require('async');

const { pgp } = require('./utils/db');
const cfg = require('./config/config');
const _initTables = require('./tasks/initTables');
const _getUrlsFromFile = require('./tasks/getUrlsFromFile');
const _setUrlsToDB = require('./tasks/setUrlsToDB');
const _getUrlsFromDB = require('./tasks/getUrlsFromDB');
const _getResults = require('./tasks/getResults');
const _setResultsToDB = require('./tasks/setResultsToDB');

async.auto({
  initTables: function (callback) {
    console.log('initTables......');
    _initTables(callback);
  },
  getUrlsFromFile: function (callback) {
    console.log('getUrlsFromFile......');
    const filePath = './config/provider_images.csv';

    _getUrlsFromFile(filePath, callback);
  },
  setUrlsToDB: ['initTables', 'getUrlsFromFile', function(results, callback){
    console.log('setUrlsToDB......');
    const values = results.getUrlsFromFile;

    _setUrlsToDB(values, callback);
  }],
  // getUrlsFromDB: ['setUrlsToDB', function (results, callback) {
  //   console.log('getUrlsFromDB......');
  //   _getUrlsFromDB(callback);
  // }],
  getUrls: ['getUrlsFromFile'/*, 'getUrlsFromDB'*/, function (results, callback) {
    console.log('getUrls......');
    // const urlsFromFile = results.getUrlsFromFile.map( url => url.url);
    // const urlsFromDB = results.getUrlsFromDB;
    // const urls = urlsFromDB.filter( url => urlsFromFile.indexOf(url.url) >= 0 );
    const urls = results.setUrlsToDB;
    console.log(urls);

    if(urls.length > 0){
      callback(null, urls);
    }else{
      callback(cfg.EMPTY);
    }
  }],
  runQueue: ['getUrls', function (results, callback) {
    console.log('runQueue......');
    const urls = results.getUrls;

    const tasks = _.chunk(urls, cfg.urlPerTask);

    const queue = async.queue(function(task, callback) {
      /* task.run(callback); */

      async.auto({
        getResults: function (callback) {
          console.log('getResults......');
          const urls = task.map( e => e.url );

          if(urls.length > 0){
            _getResults(urls, callback);
          }else{
            callback(null, cfg.EMPTY);
          }
        },
        setResultsToDB: ['getResults', function (results, callback) {
          console.log('setResultsToDB......');
          const urls = task;
          const data = JSON.parse(results.getResults.result);

          if(data.length == 0){
            callback(null, cfg.EMPTY);
          }else{
            const values = data.map(e => {
              for(let u in e){
                let out = {};
                let v = e[u];
                for(let k in v){
                  out[(k.slice(0,1).toLowerCase()+k.slice(1)).replace(/([A-Z])/g,"_$1").toLowerCase()] = v[k];
                }
                out.url_id = urls.find(e => e.url == u)..id;
                return out;
              }
            });
            _setResultsToDB(values, callback);
          }
        }],
      },
      function(err, results) {
        // results is now equal to {'one': 1, 'two': 2}
        callback(err, results);
      });

    }, cfg.taskConcurrency);

    // add some items to the queue (batch-wise)
    queue.push(tasks, function(...args) {
      console.log(args);
    });

    // assign a callback
    queue.drain = function() {
      callback(null, 'done');
    };
  }],
}, function(err, results) {
  pgp.end();
  console.log('err = ', err);
  // console.log('results = ', results);
});
