
const URL_TABLE_NAME = 'url2';
const IMAGE_TABLE_NAME = 'image2';

const URL_TABLE_FIELDS = [
  '"id" SERIAL PRIMARY KEY',
  '"provider_id" varchar(64) NOT NULL',
  '"provider_status" varchar(32) NOT NULL',
  '"shoottype" varchar(32) NOT NULL',
  '"url" varchar(512) UNIQUE NOT NULL',
];
const IMAGE_TABLE_FIELDS = [
  '"id" SERIAL PRIMARY KEY',
  '"url_id" int REFERENCES "'+URL_TABLE_NAME+'"("id") UNIQUE NOT NULL',
  '"motion_blur" real',
  '"light" real',
  '"color_harmony" real',
  '"symmetry" real',
  '"vivid_color" real',
  '"repetition" real',
  '"content" real',
  '"do_f" real',
  '"object" real',
  '"rule_of_thirds" real',
  '"balancing_element" real',
  '"score" real',
];

function gen_create_table_sql(table_name, table_fields) {
  var fields = table_fields.join(',');
  return `CREATE TABLE IF NOT EXISTS "${table_name}" (${fields})`;
}
function gen_insert_sql(table_name, conflict_field) {
  return 'insert into '+table_name+'(${this:name}) values(${this:csv}) on conflict('+conflict_field+') do nothing';
}
function gen_select_sql(table_name){
  return `select * from ${table_name}`;
}

module.exports = {
  OK: 'success',
  NOK: 'failed',
  EMPTY: 'isEmptyArray',
  urlPerTask: 3,
  taskConcurrency: 1,
  asyncParalelLimit: 5,
  retryOpt: {times: 3, interval: 200},
  // retryOpt: {
  //   times: 5,
  //   interval: function(retryCount) {
  //     return 50 * Math.pow(2, retryCount);
  //   }
  // },
  MinPixel: 500,
  ImgReg: /\.(jpe?g)(\?.*)?/,
  analysisAPI: 'http://35.202.251.156:1080/evaluation',
  // database connection:
  dbConnection: 'postgresql://postgres:root123@localhost:5432/test',
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
  URL_TABLE_NAME: URL_TABLE_NAME,
  IMAGE_TABLE_NAME: IMAGE_TABLE_NAME,
  SQL_CREATE_TABLE_DOMAIN: gen_create_table_sql(URL_TABLE_NAME, URL_TABLE_FIELDS),
  SQL_CREATE_TABLE_ANALYSIS: gen_create_table_sql(IMAGE_TABLE_NAME, IMAGE_TABLE_FIELDS),
  SQL_SELECT_FROM_DOMAIN: gen_select_sql(URL_TABLE_NAME),
  SQL_INSERT_INTO_DOMAIN: gen_insert_sql(URL_TABLE_NAME, 'url'),
  SQL_INSERT_INTO_ANALYSIS: gen_insert_sql(IMAGE_TABLE_NAME, 'url_id'),
}
