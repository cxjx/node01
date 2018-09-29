require('events').EventEmitter.defaultMaxListeners = 100;
const async = require('async');

const { pgp } = require('./utils/db');
const cfg = require('./config/config');
const _removeDir = require('./tasks/removeDir');
const _initTables = require('./tasks/initTables');
const _getDomainsFromFile = require('./tasks/getDomainsFromFile');
const _insertTableUrl = require('./tasks/insertTableUrl');
const _getDomainsFromDB = require('./tasks/getDomainsFromDB');
// const _getImageSrc = require('./tasks/getImageSrc');
// const _getAnalysisResults = require('./tasks/getAnalysisResults');
// const _insertTableImage = require('./tasks/insertTableImage');
const _run = require('./tasks/_run');

async.auto({
  removeDir: function (callback) {
    const dir = cfg.scapeOptions.directory;

    _removeDir(dir, callback);
  },
  initTables: function (callback) {
    _initTables(callback);
  },
  getDomainsFromFile: function (callback) {
    const filePath = './config/Domains.js';

    _getDomainsFromFile(filePath, callback);
  },
  insertDomains: ['initTables', 'getDomainsFromFile', function(results, callback){
    const values = results.getDomainsFromFile.map( domain => { return {name: domain} });

    _insertTableUrl(values, callback);
  }],
  getDomainsFromDB: ['insertDomains', function (results, callback) {
    _getDomainsFromDB(callback);
  }],
  readDomains: ['getDomainsFromFile', 'getDomainsFromDB', function (results, callback) {
    // const domainsFromFile = results.getDomainsFromFile;
    // const domainsFromDB = results.getDomainsFromDB;
    // const domains = domainsFromFile.filter( domain => domainsFromDB.indexOf(domain) < 0 );
    const domains = results.getDomainsFromDB;

    if(domains.length > 0){
      callback(null, domains);
    }else{
      callback(cfg.EMPTY);
    }
  }],
  run: ['removeDir', 'readDomains', function (results, callback) {
    const domains = results.readDomains;

    _run(domains, callback);
  }],
}, function(err, results) {
  pgp.end();
  console.log('err = ', err);
  console.log('results = ', results);
});
