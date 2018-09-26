# node01
npm install

# modify the config in index.js
const MinPixel = 100;
const ImgReg = /\.(jpe?g)(\?.*)?/;
const analysisAPI = 'http://xxx.xxx.xxx.xxx:1080/evaluation';
const db = pgp('postgresql://postgres:root123@localhost:5432/test');

# start
node index.js
