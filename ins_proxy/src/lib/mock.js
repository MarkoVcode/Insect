var config = require('./config.js');
var repository = require('./repository.js');
var iconsole = require('./iconsole.js');

var Mock = function () {};

Mock.prototype.extractSessionId = function (request) {
    return unpackSid(request);
}

Mock.prototype.process = function (data, request, response) {
    var mockFound = false;
        if(null != data.mockConfig && null != data.webSocketsURLs) {
            iconsole.log('Mock Resource Found!');
            var mockObject = JSON.parse(data.mockConfig);
            for(var i = 0; i < mockObject.mock.length; i++) {
               if(hasMatchingURI(mockObject.mock[i].path, unpackPath(request))) {
                   if(mockObject.mock[i].methods.hasOwnProperty(request.method)) {
                       var mockMethod = mockObject.mock[i].methods[request.method];
                       populateHeaders(response, mockMethod);
                       if(!mockMethod.body) {
                        response.setHeader("Content-Length", Buffer.byteLength(""));
                        response.writeHead(mockMethod.code);
                        response.end("");
                        mockFound = true;
                       } else {
                        var payload = JSON.stringify(mockMethod.payload);
                         response.setHeader("Content-Length", Buffer.byteLength(payload));
                         response.writeHead(mockMethod.code);
                         response.end(payload); 
                         mockFound = true;
                       }
                   } 
               }
            }
            iconsole.log('!');
        }
        if(!mockFound) {
            doMock404(response);
        }
}

var hasMatchingURI = function(mockPath, requestPath) {
    if(requestPath === '/') {
        return (mockPath === '' || mockPath === '/');
    }
    var lastChar = mockPath.substr(mockPath.length -1);
    if(lastChar === '/') {
        var newMockPath = mockPath.substr(0,mockPath.length - 1);
        return requestPath.startsWith(newMockPath);
    }
    return mockPath === requestPath;
}

var doMock404 = function(response) {
    iconsole.log('Mock 404');
    response.setHeader("Content-Type","application/json");
    response.setHeader("Content-Length", Buffer.byteLength(""));
    response.writeHead(404);
    response.end("");
}

var extarctPathElems = function(request) {
    var uri = request.url;
    var uris = uri.split(config.getServiceMockPath());
    var pathElems = uris[1].split("/");
    return pathElems;
    var sid = pathElems[0];
}

var unpackSid = function(request) { 
    var elems = extarctPathElems(request);
    return elems[0];
}

var unpackPath = function(request) {
    var elems = extarctPathElems(request);
    var path = "/";
    for(var i = 1; i < elems.length; i++) {
        path = path + elems[i];
        if(i < elems.length-1) {
            path = path + "/";
        }
    }
    return path;
}

var populateHeaders = function (response, mockMethod) {
    var headers = mockMethod.headers;
    var defaultHeader = "Content-Type";
    if(mockMethod.body) {
        response.setHeader(defaultHeader, "application/json");
    }
    for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
            response.setHeader(key, headers[key]);
        }
    }
}

module.exports = new Mock();