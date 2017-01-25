var http = require('http');
var redis = require('redis');
var urlObj = require('url');
var session = require('./lib/session.js');
var ws;

const TOKEN_LENGTH=11;
const SERVICE_PATH='/service/proxy/';
const PORT=8080; 
const REDIS_PORT=6379;
const REDIS_HOST='127.0.0.1';

var client = redis.createClient(REDIS_PORT, REDIS_HOST);
client.on('connect', function() {
    console.log('redis connected');
});
client.on('error', function() {
    console.log('redis NOT UP!');
});

// Request:
//  http://localhost:8080/service/proxy/5aNA6ms7zNJ/system/environment
//  http://192.168.56.95:8080/service/proxy/5aNA6ms7zNJ/system/environment
// Proxy Config Endpoint:
//  http://testprvapi.thingoncloud.com/v1
// Proxy Translated:
//  http://testprvapi.thingoncloud.com/v1/system/environment

function handleRequest(request, response){
    ws = require('./lib/websockets.js');
    var sessionConfig = extractSessionConfig(request.url);
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

function handleResponse(response, proxyResponse){
    response.writeHead(proxyResponse.code, proxyResponse.message, proxyResponse.headers);
    response.end(proxyResponse.body);
}

var server = http.createServer(handleRequest);

server.listen(PORT, function() {
    console.log("Server listening on: http://localhost:%s", PORT);
});

function doProxyRequest(reply, wsUrls, sessionConfig, request, response) {
    console.log("Proxy to: " + reply);
    var proxyURLConfig = fetchProxyConfig(sessionConfig, reply); // this is going to be fetch from db on request based on sessionId
    if(proxyURLConfig == null || wsUrls == null) {
        console.log("404 due to missing configuration (no WS or proxy config)");
        response.writeHead(404);
        response.end("");
    } else {
        ws.setUrls(wsUrls);
        var requestBody = [];
        request.on('data', function(chunk) {
            requestBody.push(chunk);
        }).on('end', function() {
            var proxyOptions = prepareProxyOptions(request.method, proxyURLConfig, request.headers);
            proxy(proxyOptions, requestBody.join(''))
            .then((proxyResponse) => handleResponse(response, proxyResponse))
            .catch((err) => console.error(err));
        });
    }
}
const proxy = function(proxyOptions, body) {
    ws.setRequestObject(proxyOptions, body);
    // return new pending promise
    return new Promise((resolve, reject) => {
        // select http or https module, depending on reqested url
        const lib = proxyOptions.protocol.startsWith('https') ? require('https') : require('http');

  //  lib.headers = headers;
   // lib.body = body;
    const proxyReq = lib.request(proxyOptions, (response) => {
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(handleProxyResponse(response, body)));
    });
    // handle connection errors of the request
    proxyReq.on('error', (err) => reject(err));
    
    proxyReq.write(body);
    proxyReq.end();
    })
};

function handleProxyResponse(response, body){
    var returnObject = {'body': body.join(''), 'code': response.statusCode, 'message': response.statusMessage, 'headers': response.headers};
    ws.pushWebSocketMessage(returnObject);
    return returnObject;
}

function extractSessionConfig(url) {
// Request:
// /service/proxy/NA6ms7zNJ/system/environment
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
    // /system/environment   port:80,
    // var url = "http://testprvapi.thingoncloud.com/v1";
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

