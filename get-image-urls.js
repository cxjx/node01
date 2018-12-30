var path = require('path');
var spawn = require('child_process').spawn;
var phantomjs = require('phantomjs-prebuilt');
console.log(JSON.stringify(phantomjs));

function getImageUrls(url, callback) {
  var phantomArgs = [
    path.join(__dirname, 'lib', 'phantom_script.js'),
    url,
    // true,
  ];

  return new Promise(function(resolve, reject) {
    var phantom = spawn(phantomjs.path, phantomArgs);
    var images = null;
    var error = null;
    var result = '';

    phantom.stdout.on('data', function(data) {
      data = data.toString().replace(/\n/g, '');

      let index = data.indexOf('[data]');
      if(index != -1) {
        result += data.substring(index+'[data]'.length);
      }else{
        console.log('getUrls[stdout]' + data);
      }
    });
    phantom.stderr.on('data', function(data) {
      console.log('getUrls[stderr]' + data);
      // error = data;
    });
    phantom.on("exit", function(code) {
      console.log('getUrls[exit]', code);
    });
    phantom.on('close', function(code) {
      console.log('getUrls[close]', code);
      // console.log('getUrls[result]', result);
      try {
        images = JSON.parse(result);
      }
      catch(err) {
        console.log('getUrls[err]', err);
        error = err;
        images = null;
      }

      if (!images && !error) {
        error = new Error('no images found');
      }

      if (error) {
        reject(error);
        if (callback) callback(error, null);
      }
      else {
        resolve(images)
        if (callback) callback(null, images);
      }
    });
  })
}

module.exports = getImageUrls;
