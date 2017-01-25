var redis = require('redis');
//npm install redis
//docker run --name myredis2 -p6379:6379  -d redis:alpine
const REDIS_PORT=6379;
const REDIS_HOST='127.0.0.1';

var client = redis.createClient(REDIS_PORT, REDIS_HOST);

client.on('connect', function() {
    console.log('connected');
});

client.set('5aNA6ms7zNJ', 'http://testprvapi.thingoncloud.com/v1');
client.expire('5aNA6ms7zNJ', 60*60*24);
client.set('5aNA6ms7zNJ_WS', 'http://localhost:8811/client/proxydata');
client.expire('5aNA6ms7zNJ_WS', 60*60*24);

client.get('5aNA6ms7zNJ', function(err, reply) {
    console.log(reply);
});

client.get('5aNA6ms7zNJ_WS', function(err, reply) {
    console.log(reply);
});