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

Repository.prototype.process = function () {

}

Repository.prototype.populateHeaders = function () {

}

module.exports = new Repository();