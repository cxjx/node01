# node01
npm install


# modify the config in config/config.js
const MinPixel = 100;

const ImgReg = /\.(jpe?g)(\?.*)?/;

const analysisAPI = 'http://xxx.xxx.xxx.xxx:1080/evaluation';

const db = pgp('postgresql://postgres:root123@localhost:5432/test');


# start
node --max-old-space-size=4096 index.js | tee debug.log


# docker
docker build -t chenx/node-web-app .

docker run -p 3000:3000 -d chenx/node-web-app


# curl
curl -X POST -H 'Content-type':'application/json' -d '{"url":"www.snappr.co","pixel":200,"method":2}' http://localhost:3000/evaluation

curl -X GET 'http://localhost:3000/evaluation?url=www.snappr.co&pixel=200&method=2'

