var config = require('../config/config.json');

var Config = function () {};

Config.prototype.environment = function () {
    if(config.ENVIRONMENT == "<ENVIRONMENT>") {
        return "DEVELOPMENT";
    }
    return config.ENVIRONMENT;
}

Config.prototype.getRedisHost = function () {
    if(this.environment() == "DEVELOPMENT") {
        return config.REDIS_HOST;
    }
    return config.PRODUCTION.REDIS_HOST;
}

Config.prototype.getRedisPort = function () {
    return config.REDIS_PORT;
}

module.exports = new Config();
