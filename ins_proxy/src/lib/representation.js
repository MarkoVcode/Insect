var MarkovChain = require('markovchain');
var timecounter = require('./timecounter.js');
var fs = require('fs');

var Representation = function () {};

Representation.prototype.generate = function (request, timer) {
  var quotes = new MarkovChain(fs.readFileSync('./config/quotes.txt', 'utf8'));
  var repObj = { method: request.method,
                headers: request.headers,
                    url: request.url,
              timestamp: new Date().getTime(), 
                   hint: quotes.start(useUpperCase).end(stopAfter15Words).process(),
                   time: timecounter.getElapsedTime(timer)};
  return repObj;
}

var useUpperCase = function(wordList) {
  var tmpList = Object.keys(wordList).filter(function(word) {
    return word[0] >= 'A' && word[0] <= 'Z'
  })
  return tmpList[~~(Math.random()*tmpList.length)]
}

var stopAfter15Words = function(sentence) {
  return sentence.split(" ").length >= 15
}

module.exports = new Representation();