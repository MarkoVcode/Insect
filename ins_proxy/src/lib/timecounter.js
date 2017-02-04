var startingTime = new Date().getTime();

var Timecounter = function () {};

Timecounter.prototype.getElapsedTime = function () {
    return (new Date().getTime()) - startingTime;
}

module.exports = new Timecounter();
