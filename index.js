const async = require('async');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const scrape = require('website-scraper');
const request = require('request');
const images = require("images");

const { pgp } = require('./utils/db');
const initTables = require('./tasks/initTables');
const removeDir = require('./tasks/removeDir');
const readDomainsFromDB = require('./tasks/readDomainsFromDB');
const readDomainsFromFile = require('./tasks/readDomainsFromFile');
const getImageSrc = require('./tasks/getImageSrc');
const getAnalysisResults = require('./tasks/getAnalysisResults');
const insertTableUrl = require('./tasks/insertTableUrl');
const insertTableImage = require('./tasks/insertTableImage');

const cfg = require('./config/config');

async.auto({
  removeDir: removeDir,
  initTables: initTables,
  readDomainsFromFile: readDomainsFromFile,
  insertDomains: ['initTables', 'readDomainsFromFile', insertTableUrl],
  readDomainsFromDB: ['initTables', readDomainsFromDB],
  readDomains: ['readDomainsFromFile', 'readDomainsFromDB', function (results, callback) {
    const domainsFromFile = results.readDomainsFromFile;
    const domainsFromDB = [];//results.readDomainsFromDB;
    const domains = domainsFromFile.filter( domain => domainsFromDB.indexOf(domain) < 0 );

    if(domains.length > 0){
      console.log('-----------readDomains----------', domains);
      callback(null, domains);
    }else{
      callback('Empty domains');
    }
  }],
  scrapeImagesUrls: ['readDomains', 'removeDir', getImageSrc],
  getAnalysisResults: ['scrapeImagesUrls', getAnalysisResults],
  convertAnalysisResults: ['getAnalysisResults', function (results, callback) {
    const res = results.getAnalysisResults;
    let data = JSON.parse(res.result);
    data = data.map(o => {
      for(let k in o){
        return Object.assign({imgurl: k}, o[k])
      }
    });
    if(data.length > 0){
      callback(null, data);
    }else{
      callback('Empty data');
    }
  }],
  saveAnalysisResults: ['insertDomains', 'convertAnalysisResults', insertTableImage],
}, function(err, results) {
  pgp.end();
  console.log('err = ', err);
  console.log('results = ', results);
});
