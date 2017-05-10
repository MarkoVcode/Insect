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

Repository.prototype.fetchMockConfig = function (proxySessionId, callback) {
    client.get(proxySessionId+'_MOCK', function(err1, mockConfig) {
        client.hgetall(proxySessionId+'_WS', function(err2, wsUrls) {
            var data = {err1:err1,
                        err2:err2,
                        mockConfig:mockConfig,
                        webSocketsURLs:wsUrls};
            callback(data);
        })
    });
}

Repository.prototype.fetchProxyRequestData = function (sessionConfig, callback) {
    client.get(sessionConfig.sessionId, function(err1, pUrl) {
        client.hgetall(sessionConfig.sessionId+'_WS', function(err2, wsUrls) {
            var data = {err1:err1,
                        err2:err2,
                        proxyURL:pUrl,
                        webSocketsURLs:wsUrls};
            callback(data);
        })
    });
}

module.exports = new Repository();