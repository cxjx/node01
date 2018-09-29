require('events').EventEmitter.defaultMaxListeners = 100;
const async = require('async');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const scrape = require('website-scraper');
const request = require('request');
const images = require("images");

const { pgp } = require('./utils/db');
const _initTables = require('./tasks/initTables');
const _removeDir = require('./tasks/removeDir');
const _getDomainsFromDB = require('./tasks/getDomainsFromDB');
const _getDomainsFromFile = require('./tasks/getDomainsFromFile');
const _getImageSrc = require('./tasks/getImageSrc');
const _getAnalysisResults = require('./tasks/getAnalysisResults');
const _insertTableUrl = require('./tasks/insertTableUrl');
const _insertTableImage = require('./tasks/insertTableImage');

const cfg = require('./config/config');
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
  scrapeImagesUrls: ['removeDir', 'readDomains', function (results, callback) {
    // [{id: 1, name: 'http://letsdothis.com'}, {id: 2, name: 'http://theathletic.com'}]
    const domains = results.readDomains;

    _getImageSrc(domains, callback);
  }],
  getAnalysisResults: ['scrapeImagesUrls', function (results, callback) {
    // {domainid: [imgurl01, imgurl02], domainid: [imgurl01, imgurl02]}
    const imageUrls = results.scrapeImagesUrls;

    _getAnalysisResults(imageUrls, callback);
  }],
  saveResults: ['insertDomains', 'getAnalysisResults', function (results, callback) {
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
      callback(cfg.EMPTY);
    }
  }],
}, function(err, results) {
  pgp.end();
  console.log('err = ', err);
  console.log('results = ', results);
});
