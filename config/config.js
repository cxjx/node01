
const URL_TABLE_NAME = 'url2';
const IMAGE_TABLE_NAME = 'image2';
const URL_NUM_PER_TASK = 10;
const TASK_CONCURRENCY = 10;
const analysisAPI = 'http://104.197.205.154:1080/evaluation';
const retryOpt = {
  times: 1,
  interval: function(retryCount) {
    // return 50 * Math.pow(2, retryCount);
    return 200
  }
};
const minPixel = 200;
const imgReg = /\.(jpe?g)(\?.*)?/;
const imageContentTypes = [
  // 'image/png',
  'image/jpeg',
  // 'image/gif',
];
// log4js
const logLevel = 'info';
const asyncParalelLimit = 5;

module.exports = {
  logLevel: logLevel,
  OK: 'success',
  NOK: 'failed',
  EMPTY: 'isEmptyArray',
  urlPerTask: URL_NUM_PER_TASK,
  taskConcurrency: TASK_CONCURRENCY,
  asyncParalelLimit: asyncParalelLimit,
  retryOpt: retryOpt,
  analysisAPI: analysisAPI,
  minPixel: minPixel,
  imgReg: imgReg,
  imageContentTypes: imageContentTypes,
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
      
      // { selector: 'param[name="movie"]', attr: 'value' },
      { selector: 'script', attr: 'src' },
      { selector: 'link[rel="stylesheet"]', attr: 'href' },
      // { selector: 'svg *[xlink\\:href]', attr: 'xlink:href' },
      // { selector: 'svg *[href]', attr: 'href' },
      // { selector: 'meta[property="og\\:audio"]', attr: 'content' },
      // { selector: 'meta[property="og\\:audio\\:url"]', attr: 'content' },
      // { selector: 'meta[property="og\\:audio\\:secure_url"]', attr: 'content' },
      // { selector: 'meta[property="og\\:video"]', attr: 'content' },
      // { selector: 'meta[property="og\\:video\\:url"]', attr: 'content' },
      // { selector: 'meta[property="og\\:video\\:secure_url"]', attr: 'content' },
      // { selector: 'video', attr: 'src' },
      // { selector: 'video source', attr: 'src' },
      // { selector: 'video track', attr: 'src' },
      // { selector: 'audio', attr: 'src' },
      // { selector: 'audio source', attr: 'src' },
      // { selector: 'audio track', attr: 'src' },
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
}
