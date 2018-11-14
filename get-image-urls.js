var path = require('path');
var spawn = require('child_process').spawn;
var phantomjs = require('phantomjs-prebuilt');

function getImageUrls(url, callback) {
  var phantomArgs = [
    path.join(__dirname, 'lib', 'phantom_script.js'),
    url
  ];

  return new Promise(function(resolve, reject) {
    var phantom = spawn(phantomjs.path, phantomArgs);
    var images = null;
    var error = null;
    var result = '';

    phantom.stdout.on('data', function(data) {
      if(data.indexOf('[debug]') == 0) {
        console.log(`${data}`);
      }else{
        result += data;
      }
    });

    phantom.stderr.on('data', function(data) {
      error = data;
    });

    phantom.on('close', function(code) {
      try {
        images = JSON.parse(result);
      }
      catch(e) {
        console.log('Error', result);
        error = e;
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