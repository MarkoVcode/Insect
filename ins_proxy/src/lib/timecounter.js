var Timecounter = function () {};

Timecounter.prototype.getStartingTime = function () {
    return new Date().getTime();
}

Timecounter.prototype.getElapsedTime = function (startingTime) {
    return (new Date().getTime()) - startingTime;
}

module.exports = new Timecounter();
