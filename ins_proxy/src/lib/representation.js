var MarkovChain = require('markovchain');
var fs = require('fs');

var Representation = function () {};

Representation.prototype.generate = function (request) {
  var quotes = new MarkovChain(fs.readFileSync('./config/quotes.txt', 'utf8'));
  var repObj = { method: request.method,
                headers: request.headers,
                    url: request.url,
              timestamp: new Date().getTime(), 
                  hint: quotes.start(useUpperCase).end(stopAfterFiveWords).process()};
  return repObj;
}

var useUpperCase = function(wordList) {
  var tmpList = Object.keys(wordList).filter(function(word) {
    return word[0] >= 'A' && word[0] <= 'Z'
  })
  return tmpList[~~(Math.random()*tmpList.length)]
}

var stopAfterFiveWords = function(sentence) {
  return sentence.split(" ").length >= 15
}

module.exports = new Representation();