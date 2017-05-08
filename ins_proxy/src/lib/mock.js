var config = require('./config.js');
var repository = require('./repository.js');

var Mock = function () {};

Mock.prototype.process = function (request) {
    var uri = request.url;
    var uris = uri.split(config.getServiceMockPath());
    var pathElems = uris[1].split("/");
    var sid = pathElems[0];

    var mockSettings = {code: 200, bodystring: "{}"};
    return null;
}

Mock.prototype.populateHeaders = function (response, mockSettings) {
    response.setHeader("Content-Type","application/json");
    response.setHeader("Content-Length", Buffer.byteLength(sendContent));
    return repObj;
}

module.exports = new Mock();