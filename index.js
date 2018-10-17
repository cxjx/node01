require('events').EventEmitter.defaultMaxListeners = 100;
const _ = require('lodash');
const async = require('async');

const { pgp } = require('./utils/db');
const cfg = require('./config/config');
const _initTables = require('./tasks/initTables');
const _getUrlsFromFile = require('./tasks/getUrlsFromFile');
const _setUrlsToDB = require('./tasks/setUrlsToDB');
const _getUrlsFromDB = require('./tasks/getUrlsFromDB');
const _getResults = require('./getResults');
const _setResultsToDB = require('./setResultsToDB');

async.auto({
  initTables: function (callback) {
    _initTables(callback);
  },
  getUrlsFromFile: function (callback) {
    const filePath = './config/provider_images.csv';

    _getUrlsFromFile(filePath, callback);
  },
  setUrlsToDB: ['initTables', 'getUrlsFromFile', function(results, callback){
    const values = results.getUrlsFromFile;

    _setUrlsToDB(values, callback);
  }],
  getUrlsFromDB: ['setUrlsToDB', function (results, callback) {
    _getUrlsFromDB(callback);
  }],
  getUrls: ['getUrlsFromFile', 'getUrlsFromDB', function (results, callback) {
    const urlsFromFile = results.getUrlsFromFile;
    const urlsFromDB = results.getUrlsFromDB;
    const urls = urlsFromDB.filter( url => urlsFromFile.indexOf(url.url) >= 0 );

    if(urls.length > 0){
      callback(null, urls);
    }else{
      callback(cfg.EMPTY);
    }
  }],
  getResults: ['getUrls', function (results, callback) {
    const urls = results.getUrls.map( url =>  url.url );

    if(urls.length > 0){
      _getResults(urls, callback);
    }else{
      callback(null, cfg.EMPTY);
    }
  }],
  setResultsToDB: ['getResults', function (results, callback) {
    const urls = results.getUrls;
    const data = JSON.parse(results.getResults.result).reduce((r,e) => _.extend(r,e), {});

    const values =  urls.map(url => {
      let d = data[url.url];
      let out = {};
      for(let k in d){
        out[(k.slice(0,1).toLowerCase()+k.slice(1)).replace(/([A-Z])/g,"_$1").toLowerCase()] = d[k];
      }
      console.log(`[${url.id}|${url.url}] ${JSON.stringify(out)}`);
      return _.extend({url_id: url.id}, out);
    });

    if(values.length > 0){
      _setResultsToDB(values, callback)
    }else{
      callback(null, cfg.EMPTY);
    }
  }],
}, function(err, results) {
  pgp.end();
  console.log('err = ', err);
  // console.log('results = ', results);
});
