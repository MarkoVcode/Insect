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

Config.prototype.isConsoleOut = function () {
    if(this.environment() == "DEVELOPMENT") {
        return config.CONSOLE_OUT;
    }
    return config.PRODUCTION.CONSOLE_OUT;
}

Config.prototype.getRedisPort = function () {
    return config.REDIS_PORT;
}

Config.prototype.getTokenLength = function () {
    return config.TOKEN_LENGTH;
}

Config.prototype.getServicePath = function () {
    return config.SERVICE_PATH;
}

Config.prototype.getServiceMockPath = function () {
    return config.SERVICE_MOCK_PATH;
}

Config.prototype.getReleaseKey = function () {
    return config.BUILD.RELEASEKEY;
}

Config.prototype.getServiceTestPath = function () {
    return config.SERVICE_TEST_PATH;
}

Config.prototype.getPort = function () {
    return config.PORT;
}

module.exports = new Config();
