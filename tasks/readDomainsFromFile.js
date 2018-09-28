const readline = require('readline');
const fs = require('fs-extra');

const filePath = './config/Domains.js';
const domainFilter = function (line) {
  let domain = line.trim();
  let reg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
  return reg.test(domain) ? ('http://'+domain) : false;
};

const readDomainsFromFile = function (callback) {
  const rd = readline.createInterface({
    input: fs.createReadStream(filePath),
  });

  let lines = [];
  rd.on('line', line => {
      // console.log(`line: ${line}`);
      let domain = domainFilter(line);
      if(domain){
        lines.push(domain)
      };
    })
    .on('close', () => {
      // console.log(`lines: ${lines}`);
      callback(null, lines);
    })
};

// readDomainsFromFile(function(...args){console.log(args[1])});
module.exports = readDomainsFromFile;