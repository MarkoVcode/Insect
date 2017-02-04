var http = require('http');
var urlObj = require('url');
var zlib = require("zlib");
var requestOptions;
var requestBody;
var urls;

var WS = function () {};

WS.prototype.setUrls = function (wsurls) {
    urls = wsurls;
}

WS.prototype.setRequestObject = function (proxyOptions, body) {
    requestOptions = proxyOptions;
    requestBody = body;
}

WS.prototype.pushWebSocketMessage = function (responseObj) {
    if( responseObj.response.headers['content-encoding'] == 'gzip' ) {
        var buffer = Buffer.concat(responseObj.body);
        zlib.gunzip(buffer,  function (_, result) { 
            prepareToDispatch(responseObj, result);
        });
    } else if (responseObj.response.headers['content-encoding'] == 'deflate') {
        var buffer = Buffer.concat(responseObj.body);
        zlib.inflate(buffer,  function (_, result) { 
            prepareToDispatch(responseObj, result);
        });
    } else {
        var body = responseObj.body.join('')
        prepareToDispatch(responseObj, body);
    }
};

var prepareToDispatch = function(responseObj, decompressedBody) {
    var payload = assemblyWSPayload(responseObj, decompressedBody);
    for (var property in urls) {
        if (urls.hasOwnProperty(property)) {
            var url = generateWSUrl(property, urls[property]);
            console.log("Message: " + payload + " To: " + url);
            dispatchPayload(payload, url)
            .then((response) => processResponse(response))
            .catch((err) => processError(err));
        }
    }
}

var processResponse = function(response) {

}

var processError = function(err) {

}

const dispatchPayload = function(payload, url) {
    return new Promise((resolve, reject) => {
        const lib = require('http');
        const proxyReq = lib.request(generateRequestOptions(url, payload), (response) => {
            const body = [];
            response.on('data', (chunk) => body.push(chunk));
            response.on('end', () => resolve(response));
        });
        proxyReq.on('error', (err) => reject(err));
        proxyReq.write(payload);
        proxyReq.end();
    })
}

var generateWSUrl = function(sessionId, wsURL) {
    return wsURL + "/push/" + sessionId;
}

var generateRequestOptions = function(url, payload) {
    var parsedUrl = urlObj.parse(url);
    var host = parsedUrl.host;
    var ind = host.indexOf(":");
    if(ind !== -1) {
        host = host.substring(0,ind);
    }
    return {path: parsedUrl.path,
        method:'POST',
        port: parsedUrl.port,
        host: host,
        protocol: parsedUrl.protocol,
        timeout: 500,
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload)
        }
        };
}

var assemblyWSPayload = function(responseObj, body) {
    var responseHeader = base64String(JSON.stringify(responseObj.response.headers));
    var responseBody = base64String(body);
    var responseCode = responseObj.response.statusCode;
    var responseMessage = responseObj.response.statusMessage;

    var requestHeader = base64String(JSON.stringify(requestOptions.headers));
    var requestBody2 = base64String(requestBody);
    var requestMethod = requestOptions.method;
    var requestHost = requestOptions.host;
    var requestPath = requestOptions.path;
    var requestProtocol = requestOptions.protocol;
    var requestPort = requestOptions.port;

    var wsObject = {
        proxy: {
            general: {
                clientIP: "0.0.0.0",
                responseTime: responseObj.responseTime
            },
            request: {
                header: requestHeader,
                body: requestBody2,
                method: requestMethod,
                host: requestHost,
                path: requestPath,
                protocol: requestProtocol,
                port: requestPort
            },
            response: {
                header: responseHeader,
                body: responseBody,
                code: responseCode,
                responseTime: responseObj.responseTime,
                message: responseMessage
            }
        }
    }
    return JSON.stringify(wsObject);
}

var base64String = function(string) {
    //new Buffer("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'))
    return new Buffer(string).toString('base64');
}

module.exports = new WS();
