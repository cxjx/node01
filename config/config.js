const pgp = require('pg-promise')({
  // Initialization Options
  capSQL: true // capitalize all generated SQL
});

module.exports = {
  /* https://github.com/website-scraper/node-website-scraper/blob/master/lib/config/defaults.js */
  scapeOptions: {
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
  },
  MinPixel: 500,
  ImgReg: /\.(jpe?g)(\?.*)?/,
  analysisAPI: 'http://localhost:1080/evaluation',
  // Creating a new database instance from the connection details:
  dbConnection: 'postgresql://postgres:root123@localhost:5432/test',
  // our set of columns, to be created only once, and then shared/reused,
  // to let it cache up its formatting templates for high performance:
  ColumnSet_domain: new pgp.helpers.ColumnSet(['name'], {table: 'domain'}),
  ColumnSet_analysis: new pgp.helpers.ColumnSet([
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
  ], {table: 'analysis'}),
  SQL_CREATE_TABLE_DOMAIN: 'CREATE TABLE IF NOT EXISTS "domain" \
    (\
      "id" SERIAL PRIMARY KEY, \
      "name" varchar(64) UNIQUE NOT NULL\
    )',
  SQL_CREATE_TABLE_ANALYSIS: 'CREATE TABLE IF NOT EXISTS "analysis" \
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
    )',
  SQL_SELECT_FROM_DOMAIN: 'select name from domain',
  SQL_INSERT_INTO_DOMAIN: 'insert into domain(${this:name}) values(${this:csv}) on conflict(name) do nothing;',
  SQL_INSERT_INTO_ANALYSIS: 'insert into analysis(${this:name}) values(${this:csv}) on conflict(imgurl) do nothing;',
}