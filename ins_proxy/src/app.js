var http = require('http');
var redis = require('redis');
var urlObj = require('url');
var session = require('./lib/session.js');
var config = require('./lib/config.js');
var representation = require('./lib/representation.js');

var ws;
var timer;

const TOKEN_LENGTH=11;
const SERVICE_PATH='/service/proxy/';
const SERVICE_TEST_PATH='/service/selftest';
const PORT=8080;

var client = redis.createClient(config.getRedisPort(), config.getRedisHost());
console.log(config.environment());
console.log(config.getRedisHost());
client.on('connect', function() {
    console.log('redis connected');
});
client.on('error', function() {
    console.log('redis NOT UP!');
});

function handleRequest(request, response){
    var url = request.url;
    if(url.indexOf(SERVICE_TEST_PATH) != -1) {
        var sendContent = JSON.stringify(representation.generate(request));
        response.setHeader("Content-Type","application/json");
        response.setHeader("Content-Length", Buffer.byteLength(sendContent));
        response.writeHead(200);
        response.end(sendContent);
    } else {
        ws = require('./lib/websockets.js');
        var sessionConfig = extractSessionConfig(url);
        if(isSessionIDValid(sessionConfig)) {
            client.get(sessionConfig.sessionId, function(err1, pUrl) {
                client.hgetall(sessionConfig.sessionId+'_WS', function(err2, wsUrls) {
                    doProxyRequest(pUrl, wsUrls, sessionConfig, request, response)
                })
            });
        } else {
            response.writeHead(404);
            response.end("");
        }
    }
}

function handleResponse(response, proxyResponse){
    response.writeHead(proxyResponse.response.statusCode, proxyResponse.response.statusMessage, proxyResponse.response.headers);
    var buffer = Buffer.concat(proxyResponse.body);
    response.end(buffer);
}

var server = http.createServer(handleRequest);

server.listen(PORT, function() {
    console.log("Server listening on: http://localhost:%s", PORT);
});

function doProxyRequest(reply, wsUrls, sessionConfig, request, response) {
    console.log("Proxy to: " + reply);
    var proxyURLConfig = fetchProxyConfig(sessionConfig, reply); // this is going to be fetch from db on request based on sessionId
    if(proxyURLConfig == null || wsUrls == null) {
        console.log("404 due to missing configuration (no WS session open or proxy config)");
        response.writeHead(404);
        response.end("");
    } else {
        timer = require('./lib/timecounter.js');
        ws.setUrls(wsUrls);
        var requestBody = [];
        request.on('data', function(chunk) {
            requestBody.push(chunk);
        }).on('end', function() {
            var proxyOptions = prepareProxyOptions(request.method, proxyURLConfig, request.headers);
            proxy(request, proxyOptions, requestBody.join(''))
            .then((proxyResponse) => handleResponse(response, proxyResponse))
            .catch((err) => console.error(err));
        });
    }
}
const proxy = function(request, proxyOptions, body) {
    ws.setRequestObject(proxyOptions, body);
    // return new pending promise
    return new Promise((resolve, reject) => {
        const lib = proxyOptions.protocol.startsWith('https') ? require('https') : require('http');
        const proxyReq = lib.request(proxyOptions, (response) => {
            const body = [];
            response.on('data', (chunk) => body.push(chunk));
            response.on('end', () => resolve(handleProxyResponse(request, response, body)));
        });
        proxyReq.on('error', (err) => reject(err));
        proxyReq.write(body);
        proxyReq.end();
    })
};

function handleProxyResponse(request, response, body) {
    var returnObject = {'responseTime': timer.getElapsedTime(), 'body': body, 'response': response, 'request': request};
    ws.pushWebSocketMessage(returnObject);
    return returnObject;
}

function extractSessionConfig(url) {
    var index = url.indexOf(SERVICE_PATH);
    var token = url.substring(index+SERVICE_PATH.length, index+SERVICE_PATH.length+TOKEN_LENGTH);
    var uri = url.substring(index+SERVICE_PATH.length+TOKEN_LENGTH, url.length);
    return {sessionId: token,
    uri: uri};
}

function isSessionIDValid(sessionConfig) {
    return session.isIdValid(sessionConfig.sessionId);
}

function fetchProxyConfig(sessionConfig, proxyTo) {
    if(proxyTo != null && proxyTo.length > 0) {
        var parsedUrl = urlObj.parse(proxyTo);
        var host = parsedUrl.host;
        var port = parsedUrl.port;
        var ind = host.indexOf(":");
        if(ind !== -1) {
            host = host.substring(0,ind);
        }
        var proxyPath = parsedUrl.path + sessionConfig.uri;
        return {sessionId: sessionConfig.sessionId,
            protocol: parsedUrl.protocol,
            uri: sessionConfig.uri,
            configEndpoint: proxyTo,
            host: host,
            port: port,
            path: proxyPath};
        }
    return null;
}

function prepareProxyOptions(method, config, headers){
    headers['host'] = config.host;
    return {
      protocol: config.protocol,
      host: config.host,
      port: config.port,
      path: config.path,
      method: method,
      headers: headers,
      timeout: 500
    };
}

