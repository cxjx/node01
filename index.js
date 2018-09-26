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
/* https://github.com/website-scraper/node-website-scraper/blob/master/lib/config/defaults.js */
const scapeOptions = {
  directory: './tmp/download/',
  filenameGenerator: 'byType',
  defaultFilename: 'index.html',
  prettifyUrls: false,
  sources: [
    { selector: 'style' },
    { selector: '[style]', attr: 'style' },
    { selector: 'img', attr: 'src' },
    { selector: 'img', attr: 'srcset' },
    { selector: 'input', attr: 'src' },
    { selector: 'object', attr: 'data' },
    { selector: 'embed', attr: 'src' },
    { selector: 'link[rel*="icon"]', attr: 'href' },
    { selector: 'picture source', attr: 'srcset' },
    { selector: 'meta[property="og\\:image"]', attr: 'content' },
    { selector: 'meta[property="og\\:image\\:url"]', attr: 'content' },
    { selector: 'meta[property="og\\:image\\:secure_url"]', attr: 'content' },
    { selector: 'frame', attr: 'src' },
    { selector: 'iframe', attr: 'src' },
  ],
  subdirectories: [
    { directory: 'images', extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    { directory: 'js', extensions: ['.js'] },
    { directory: 'css', extensions: ['.css'] },
    { directory: 'media', extensions: ['.mp4', '.mp3', '.ogg', '.webm', '.mov', '.wave', '.wav', '.flac'] },
    { directory: 'fonts', extensions: ['.ttf', '.woff', '.woff2', '.eot', '.svg'] },
  ],
  request: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19',
    },
    encoding: 'binary',
    strictSSL: false,
    jar: true,
    gzip: true,
  },
  requestConcurrency: Infinity,
  urlFilter: null,
  recursive: false,
  maxRecursiveDepth: null,
  maxDepth: null,
  ignoreErrors: true,
  httpResponseHandler: null,
  onResourceSaved: null,
  onResourceError: null,
  resourceSaver: null,
  updateMissingSources: false,
};
const MinPixel = 100;
const analysisAPI = 'http://35.202.251.156:1080/evaluation';
// Creating a new database instance from the connection details:
const db = pgp('postgresql://postgres:root123@localhost:5432/test');
// our set of columns, to be created only once, and then shared/reused,
// to let it cache up its formatting templates for high performance:
const ColumnSet_domain = new pgp.helpers.ColumnSet(['name'], {table: 'domain'});
const ColumnSet_analysis = new pgp.helpers.ColumnSet([
  'imgurl',
  'MotionBlur',
  'Light',
  'ColorHarmony',
  'Symmetry',
  'VividColor',
  'Repetition',
  'Content',
  'DoF',
  'Object',
  'RuleOfThirds',
  'BalancingElement',
  'score',
], {table: 'analysis'});
const SQL_CREATE_TABLE_DOMAIN = 'CREATE TABLE IF NOT EXISTS "domain" \
  (\
    "id" SERIAL PRIMARY KEY, \
    "name" character(64) UNIQUE NOT NULL\
  )';
const SQL_CREATE_TABLE_ANALYSIS = 'CREATE TABLE IF NOT EXISTS "analysis" \
  (\
    "id" SERIAL PRIMARY KEY, \
    "domainid" int REFERENCES "domain"("id"), \
    "imgurl" varchar(512) UNIQUE NOT NULL, \
    "MotionBlur" real, \
    "Light" real, \
    "ColorHarmony" real, \
    "Symmetry" real, \
    "VividColor" real, \
    "Repetition" real, \
    "Content" real, \
    "DoF" real, \
    "Object" real, \
    "RuleOfThirds" real, \
    "BalancingElement" real, \
    "score" real\
  )';


async.auto({
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
  readDomains: function (callback) {
    let domains = [];
    fs.readFile('./config/Domains.js', 'utf-8', (err, data) => {
      if(err){
        callback(err);
      }else{
        domains = data.split(/\r?\n/ig) .map( domain => {
          return 'http://' + domain;
        });
        if(domains.length > 0){
          console.log('-----------readDomains----------', domains);
          callback(null, domains);
        }else{
          callback('Empty domains');
        }
      }
    });
  },
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
  scrapeImagesUrls: ['readDomains', 'removeScrapeDir', function (results, callback) {
    const domains = results.readDomains;
    let imageUrls = [];

    const options = _.extend({}, scapeOptions, {
      urls: domains,
      onResourceSaved: (resource) => {
        console.log(resource.filename);
        if(/\.(jpe?g)(\?.*)?/.test(resource.filename)){
          const basePath = path.resolve(process.cwd(), scapeOptions.directory);
          const fileName = path.join(basePath, resource.filename);
          const imgSize = images(fileName).size();

          if(Math.max(imgSize.width,imgSize.height) >= MinPixel){
            imageUrls.push(resource.url);
          }
        }
      },
    });

    scrape(options, (err, data) => {
      if(err){
        callback(err)
      }else{
        console.log('-----------scrapeImagesUrls----------', imageUrls);
        if(imageUrls.length > 0){
          callback(null, imageUrls);
        }else{
          callback('Empty imageUrls');
        }
      }
    });
  }],
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
    callback(null, data);
  }],
  saveDomains: ['createTables', 'readDomains', function (results, callback) {
    const domains = results.readDomains;
    // data input values:
    const values = domains.map( domain => { return {name: domain} });
    const cs = ColumnSet_domain;
    // generating a multi-row insert query:
    const query = pgp.helpers.insert(values, cs);
    // executing the query:
    db.none(query)
      .then(data => {
        callback(null, 'success');
      })
      .catch(error => {
        callback(error, null);
      });
  }],
  saveAnalysisResults: ['saveDomains', 'convertAnalysisResults', function (results, callback) {
    // data input values:
    const values = results.convertAnalysisResults;
    const cs = ColumnSet_analysis;
    // generating a multi-row insert query:
    const query = pgp.helpers.insert(values, cs);
    // executing the query:
    db.none(query)
      .then(data => {
        callback(null, 'success');
      })
      .catch(error => {
        callback(error, null);
      });
  }],
}, function(err, results) {
  pgp.end();
  console.log('err = ', err);
  console.log('results = ', results);
});
