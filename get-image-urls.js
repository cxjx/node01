var path = require('path');
var spawn = require('child_process').spawn;
var phantomjs = require('phantomjs-prebuilt');
console.log(JSON.stringify(phantomjs));

function getImageUrls(url, callback) {
  var phantomArgs = [
    // '--load-images=no',
    // '--disk-cache=yes',
    path.join(__dirname, 'lib', 'phantom_script.js'),
    url,
    // true,
  ];

  return new Promise(function(resolve, reject) {
    var phantom = spawn(phantomjs.path, phantomArgs);
    var images = [];
    var error = null;
    var result = '';

    phantom.stderr.on('data', function(data) {
      console.log(Object.prototype.toString.call(data));

      data = data.toString().replace(/\n/g, '');
      // let index = data.indexOf('[data]');
      // if(index != -1) {
      //   result += data.substring(index+'[data]'.length);
      // }else{
      //   console.log('getUrls[stdout]' + data);
      // }
      result += data;
    });
    phantom.stdout.on('data', function(data) {
      console.log('getUrls[stderr]' + data);
    });
    phantom.on("exit", function(code) {
      console.log('getUrls[exit]', code);
    });
    phantom.on("error", function(code) {
      console.log('getUrls[error]', code);
    });
    phantom.on('close', function(code) {
      console.log('getUrls[close]', code);

      try {
        images = JSON.parse(result||'[]');
      }catch(parseErr) {
        console.log(result);
        error = parseErr;
      }

      if(error) {
        if (callback) callback(error, null);
        reject(error);
      }else{
        if (callback) callback(null, images);
        resolve(images);
      }
    });
  })
}

module.exports = getImageUrls;
