var redis = require('redis');
var config = require('./config.js');
var iconsole = require('./iconsole.js');

var client = redis.createClient(config.getRedisPort(), config.getRedisHost());
client.on('connect', function() {
    iconsole.log('Repository: Redis Connected');
});
client.on('error', function() {
    iconsole.log('Repository: Redis NOT UP!');
});

var Repository = function () {};

Repository.prototype.fetchProxyUrl = function () {

}

Repository.prototype.fetchWSUrls = function () {

}

Repository.prototype.fetchProxyRequestData = function (sessionConfig, callback) {
    client.get(sessionConfig.sessionId, function(err1, pUrl) {
        client.hgetall(sessionConfig.sessionId+'_WS', function(err2, wsUrls) {
            var data = {err1:err1,
                        err2:err2,
                        proxyURL:pUrl,
                        webSockets:wsUrls};
            callback(data);
        })
    });
}

module.exports = new Repository();