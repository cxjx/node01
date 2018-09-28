
const URL_TABLE_NAME = 'url';
const IMAGE_TABLE_NAME = 'image';

module.exports = {
  OK: 'success',
  NOK: 'failed',
  EMPTY: 'isEmptyArray',
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
  // database connection:
  dbConnection: 'postgresql://postgres:root123@localhost:5432/test',
  URL_TABLE_NAME: URL_TABLE_NAME,
  IMAGE_TABLE_NAME: IMAGE_TABLE_NAME,
  SQL_CREATE_TABLE_DOMAIN: 'CREATE TABLE IF NOT EXISTS "'+URL_TABLE_NAME+'" \
    (\
      "id" SERIAL PRIMARY KEY, \
      "name" varchar(64) UNIQUE NOT NULL\
    )',
  SQL_CREATE_TABLE_ANALYSIS: 'CREATE TABLE IF NOT EXISTS "'+IMAGE_TABLE_NAME+'" \
    (\
      "id" SERIAL PRIMARY KEY, \
      "urlid" int REFERENCES "'+URL_TABLE_NAME+'"("id"), \
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
  SQL_SELECT_FROM_DOMAIN: 'select * from '+URL_TABLE_NAME,
  SQL_INSERT_INTO_DOMAIN: 'insert into '+URL_TABLE_NAME+'(${this:name}) values(${this:csv}) on conflict(name) do nothing',
  SQL_INSERT_INTO_ANALYSIS: 'insert into '+IMAGE_TABLE_NAME+'(${this:name}) values(${this:csv}) on conflict(imgurl) do nothing',
}
