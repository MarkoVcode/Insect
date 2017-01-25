var redis = require('redis');
//npm install redis
//docker run --name myredis2 -p6379:6379  -d redis:alpine
const REDIS_PORT=6379;
const REDIS_HOST='127.0.0.1';

var proxySessionId = 'b6JZhSj4y2d';

var client = redis.createClient(REDIS_PORT, REDIS_HOST);

client.on('connect', function() {
    console.log('connected');
});

client.get(proxySessionId, function(err1, pUrl) {
    client.hgetall(proxySessionId+'_WS', function(err2, wsUrls) {
        showContent(pUrl, wsUrls)
    })
});

function showContent(pUrl, urls) {
    console.log("Proxy config: " + pUrl);
    for (var property in urls) {
        if (urls.hasOwnProperty(property)) {
            console.log(property + " -> " + urls[property]);
        }
    }
}