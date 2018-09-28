const readline = require('readline');
const fs = require('fs-extra');

const domainFilter = function (line) {
  let domain = line.trim();
  let reg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
  return reg.test(domain) ? ('http://'+domain) : false;
};

const getDomainsFromFile = function (filePath, callback) {
  const filePath = filePath || './config/Domains.js';
  const rd = readline.createInterface({
    input: fs.createReadStream(filePath),
  });

  let urls = [];
  rd.on('line', line => {
      // console.log(`line: ${line}`);
      let domain = domainFilter(line);
      if(domain){
        urls.push(domain)
      };
    })
    .on('close', () => {
      // console.log(`urls: ${urls}`);
      callback(null, urls);
    })
};

// getDomainsFromFile(function(...args){console.log(args[1])});
module.exports = getDomainsFromFile;