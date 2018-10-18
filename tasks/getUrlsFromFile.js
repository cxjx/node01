const csv = require('csvtojson');

const getUrlsFromFile = function (filePath, callback) {
  csv()
  .fromFile(filePath)
  .then(data => {
    callback(null, data);
  })
  .catch(err => {
    callback(err);
  });
};

module.exports = getUrlsFromFile;
