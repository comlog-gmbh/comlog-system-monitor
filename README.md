# Watch a file for changes

Installation via
```sh
$ npm install -s comlog-system-monitor-filetime
```

# Usage
```javascript
var Service = require('comlog-system-monitor-filetime');

var csmf = new Service({
	path: "/var/log/messages", // Or function
	interval: 60000, // 1 Minute
	timeout: 30000 // 0.5 Minute
});

csmf.on('error', function(err) {
    console.error(err);
});

// bind event
csmf.on('down', function() {
    console.info('Log timestamp overflow');
});

// bind event
csmf.on('up', function() {
    console.info('Log timestamp is ok');
});
```
