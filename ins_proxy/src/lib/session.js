var crypto = require('crypto');

var Session = function () {};

Session.prototype.isIdValid = function (sessionId) {
    if(sessionId.length === 11) {
        var trueKey = sessionId.substring(2, sessionId.length);
        var h_p = crypto.createHash('md5').update(trueKey).digest("hex").substring(0, 2);
        if(h_p+trueKey == sessionId) {
            return true;
        }
    }
    return false;
}

module.exports = new Session();