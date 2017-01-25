var http = require('http');
var urlObj = require('url');

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
    var payload = assemblyWSPayload(responseObj);
    for (var property in urls) {
        if (urls.hasOwnProperty(property)) {
            var url = generateWSUrl(property, urls[property]);
            console.log("Message: " + payload + " To: " + url);
            dispatchPayload(payload, url)
            .then((response) => processResponse(response))
            .catch((err) => processError(err));
        }
    }

};

var processResponse = function(response) {

}

var processError = function(err) {

}

const dispatchPayload = function(payload, url) {
    return new Promise((resolve, reject) => {
        const lib = require('http');
        const proxyReq = lib.request(generateRequestOptions(url), (response) => {
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

var generateRequestOptions = function(url) {
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
        timeout: 500};
}

var assemblyWSPayload = function(responseObj) {
    var responseHeader = base64String(JSON.stringify(responseObj.headers));
    var responseBody = base64String(responseObj.body);
    var responseCode = responseObj.code;
    var responseMessage = responseObj.message;

    var requestHeader = base64String(JSON.stringify(requestOptions.headers));
    var requestBody2 = base64String(requestBody);
    var requestMethod = requestOptions.method;
    var requestHost = requestOptions.host;
    var requestPath = requestOptions.path;
    var requestProtocol = requestOptions.protocol;
    var requestPort = requestOptions.port;

    var wsObject = {
        proxy: {
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