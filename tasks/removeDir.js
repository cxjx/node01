const fs = require('fs-extra');
const cfg = require('../config/config');

const removeDir = function (dir, callback) {
  fs.remove(dir, err => {
    if(err){
      callback(err||cfg.NOK);
    }else{
      callback(null, cfg.OK);
    }
  });
};

// removeDir(function(...args){console.log(args[1])});
module.exports = removeDir;