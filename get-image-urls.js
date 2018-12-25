var path = require('path');
var spawn = require('child_process').spawn;
var phantomjs = require('phantomjs-prebuilt');

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
      data = data.toString();
      let index = data.indexOf('[data]');
      if(index != -1) {
        result += data.substring(index+'[data]'.length).replace('\n','');
      }else{
        // console.log(data);
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