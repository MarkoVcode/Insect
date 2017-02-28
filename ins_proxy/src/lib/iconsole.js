var config = require('./config.js');

var IConsole = function () {};

IConsole.prototype.log = function (message, arg) {
    if(config.isConsoleOut()) {
        if(typeof arg !== 'undefined') {
            console.log(message, arg);
        } else {
            console.log(message);
        }
    }
}

module.exports = new IConsole();
