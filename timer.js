var events = require("events");

function Timer(duration) {
    this.duration = duration;
}

Timer.prototype = new events.EventEmitter();
Timer.prototype.__proto__ = events.EventEmitter.prototype;
Timer.prototype.duration = -1;
Timer.prototype.interval = -1;

Timer.prototype.start = function() {
    var self = this;
    self.emit("start",self.duration);

    setTimeout(function(){
        self.emit("end");
    }, self.duration);
};

// try it out

var t = new Timer(2000);

t.on("start", function(duration) { console.log("Timer started: " + duration); });
t.on("end", function() { console.log("Timer finished"); });

t.start();
