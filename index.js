const async = require('async');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const scrape = require('website-scraper');
const request = require('request');
const images = require("images");
const pgp = require('pg-promise')({
  // Initialization Options
  capSQL: true // capitalize all generated SQL
});
const initTables = require('./tasks/initTables');
const removeDir = require('./tasks/removeDir');
const readDomainsFromDB = require('./tasks/readDomainsFromDB');
const readDomainsFromFile = require('./tasks/readDomainsFromFile');
const getImageSrc = require('./tasks/getImageSrc');

const cfg = require('./config/config');

const analysisAPI = cfg.analysisAPI;
const SQL_INSERT_INTO_DOMAIN = cfg.SQL_INSERT_INTO_DOMAIN;
const SQL_INSERT_INTO_ANALYSIS = cfg.SQL_INSERT_INTO_ANALYSIS;
const db = pgp(cfg.dbConnection);

async.auto({
  initTables: initTables,
  removeScrapeDir: removeDir,
  readDomainsFromFile: readDomainsFromFile,
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
  scrapeImagesUrls: ['readDomains', 'removeScrapeDir', getImageSrc],
  getAnalysisResults: ['scrapeImagesUrls', function (results, callback) {
    /* analysis images */
    const imageUrls = results.scrapeImagesUrls;

    request.get({url: analysisAPI, body: imageUrls, json: true}, (err, response, body) => {
      if (!err && response.statusCode == 200){
        console.log('-----------getAnalysisResults----------', body);
        callback(null, body);
      }else{
        callback(err||response.statusCode);
      }
    });
  }],
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
  saveDomains: ['initTables', 'readDomains', function (results, callback) {
    // // data input values:
    const values = results.readDomains.map( domain => { return {name: domain} });
    // const cs = ColumnSet_domain;
    // // generating a multi-row insert query:
    // const query = pgp.helpers.insert(values, cs);
    // // executing the query:
    // db.none(query)
    //   .then(data => {
    //     callback(null, 'success');
    //   })
    //   .catch(error => {
    //     callback(error, null);
    //   });

    // insert via a transaction
    db.tx(t => {
      const queries = values.map(value => {
        return t.query(SQL_INSERT_INTO_DOMAIN, value);
      });
      return t.batch(queries);
    })
      .then(data => {
        callback(null, 'success');
      })
      .catch(err => {
        callback('failed');
      });
  }],
  saveAnalysisResults: ['saveDomains', 'convertAnalysisResults', function (results, callback) {
    // // data input values:
    const values = results.convertAnalysisResults;
    // const cs = ColumnSet_analysis;
    // // generating a multi-row insert query:
    // const query = pgp.helpers.insert(values, cs);
    // // executing the query:
    // db.none(query)
    //   .then(data => {
    //     callback(null, 'success');
    //   })
    //   .catch(error => {
    //     callback(error, null);
    //   });

    // insert via a transaction
    db.tx(t => {
      const queries = values.map(value => {
        return t.query(SQL_INSERT_INTO_ANALYSIS, value);
      });
      return t.batch(queries);
    })
      .then(data => {
        console.log('-----------saveAnalysisResults----------', data);
        callback(null, 'success');
      })
      .catch(err => {
        callback('failed');
      });
  }],
}, function(err, results) {
  pgp.end();
  console.log('err = ', err);
  console.log('results = ', results);
});
