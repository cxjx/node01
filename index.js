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
  runQueue: ['initTables', 'getUrlsFromFile', function (results, callback) {
    console.log('runQueue......');
    const urls = results.getUrlsFromFile;
    const tasks = _.chunk(urls, cfg.urlPerTask);

    const queue = async.queue(function(task, callback) {
      /* task.run(callback); */
      async.auto({
        setUrlsToDB: function(callback){
          const values = task;

          _setUrlsToDB(values, callback);
        },
        getUrlsFromDB: ['setUrlsToDB', function (results, callback) {
          // _getUrlsFromDB(callback);
          callback(null, _.flatten(results.setUrlsToDB));
        }],
        getResults: ['getUrlsFromDB', function (results, callback) {
          const urls = results.getUrlsFromDB;

          if(urls.length == 0){
            callback(cfg.EMPTY);
          }else{
            _getResults(urls, callback);
          }
        }],
        setResultsToDB: ['getResults', function (results, callback) {
          const urls = results.getUrlsFromDB;
          const data = JSON.parse(results.getResults.result);

          if(data.length == 0){
            callback(cfg.EMPTY);
          }else{
            const values = data.map(e => {
              for(let u in e){
                const url = urls.find(e => e.url == u);

                let out = {};
                let v = e[u];
                for(let k in v){
                  out[(k.slice(0,1).toLowerCase()+k.slice(1)).replace(/([A-Z])/g,"_$1").toLowerCase()] = v[k];
                }
                out.url_id = url.id;
                console.log(`${url.id}|${url.url}|${JSON.stringify(out)}`);
                return out;
              }
            });
            _setResultsToDB(values, callback);
          }
        }],
      },
      function(err, results) {
        callback(err, results);
      });

    }, cfg.taskConcurrency);

    // add some items to the queue (batch-wise)
    queue.push(tasks/*, function(err, results) {}*/);

    // assign a callback
    queue.drain = function() {
      callback(null, 'done');
    };

    process.on('SIGINT', function () {
      console.log('Exit now! Waiting for the current tasks to be processed......');
      queue.remove(function (data) { return true });
    });
  }],
}, function(err, results) {
  pgp.end();
  console.log('err = ', err);
  // console.log('results = ', results);
  process.exit();
});

