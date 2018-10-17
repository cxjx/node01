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

/* test */
// const filePath = '../config/provider_images.csv';
// getUrlsFromFile(filePath, function(...args){
//   console.log(args[1][0])
// });

module.exports = getUrlsFromFile;
