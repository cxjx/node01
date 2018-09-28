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
const readDomainsFromFile = require('./tasks/readDomainsFromFile');
const getImageSrc = require('./tasks/getImageSrc');

const cfg = require('./config/config');
const scapeOptions = cfg.scapeOptions;
const MinPixel = cfg.MinPixel;
const ImgReg = cfg.ImgReg;
const analysisAPI = cfg.analysisAPI;
const ColumnSet_domain = cfg.ColumnSet_domain;
const ColumnSet_analysis = cfg.ColumnSet_analysis;
const SQL_CREATE_TABLE_DOMAIN = cfg.SQL_CREATE_TABLE_DOMAIN;
const SQL_CREATE_TABLE_ANALYSIS = cfg.SQL_CREATE_TABLE_ANALYSIS;
const SQL_SELECT_FROM_DOMAIN = cfg.SQL_SELECT_FROM_DOMAIN;
const SQL_INSERT_INTO_DOMAIN = cfg.SQL_INSERT_INTO_DOMAIN;
const SQL_INSERT_INTO_ANALYSIS = cfg.SQL_INSERT_INTO_ANALYSIS;
const db = pgp(cfg.dbConnection);
const domainsFilePath = './config/Domains.js';


async.auto({
  removeScrapeDir: function (callback) {
    fs.remove(scapeOptions.directory, err => {
      if(err){
        callback(err);
      }else{
        console.log('-----------removeScrapeDir----------', scapeOptions.directory);
        callback(null, `remove ${scapeOptions.directory} success`);
      }
    });
  },
  createTables: function (callback) {
    db.task('create-tables', t => {
      // execute a chain of queries against the task context, and return the result:
      return t.none(SQL_CREATE_TABLE_DOMAIN).then(() => {
        return t.none(SQL_CREATE_TABLE_ANALYSIS).then(() => {
          return 'sucess';
        });
      });
    })
      .then(data => {
        console.log('-----------createTables----------', data);
        callback(null, 'success');
      })
      .catch(error => {
        console.log(error);
        callback('failed');
      });
  },
  readDomainsFromFile: readDomainsFromFile,
  readDomainsFromDB: ['createTables', function (results, callback) {
    let domains = [];
    db.query(SQL_SELECT_FROM_DOMAIN)
      .then(data => {
        domains = data.map( domain => domain.name);
        console.log('-----------readDomainsFromDB----------', domains);
        callback(null, domains);
      }).catch(err => {
        callback(null, domains);
      });
  }],
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
  scrapeImagesUrls: getImageSrc,
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
  saveDomains: ['createTables', 'readDomains', function (results, callback) {
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
        console.log('-----------saveDomains----------', data);
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
