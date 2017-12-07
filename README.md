# System monitoring software

Installation local
```sh
$ npm install comlog-system-monitor
```

Installation global
```sh
$ npm install -g comlog-system-monitor
$ comlog-system-monitor /path/to/config.json/if/not/in/working/directory
```

Installation of needed modules
```sh
$ npm install -s comlog-system-monitor-filetime
```

# Usage
 - Rename config.example.json or config.example.js and configure them. 
 - Remove all the blocks you do not need.
 - Start node bin/run.js (or run comlog-system-monitor if global installed)

# Integration

```javascript
// Disable ssl check if you need it
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var CSM = new (require('./comlog-system-monitor.js'))();

// Add a watcher service
CSM.addWatcher({
	"name": "Processlog",
	"interval": 10000,
	"type": "filetime",
	"timeout": 60000,
	"debug": true,
	"path": "function() {\n\tvar path = process.env.TEMP;\n\n\tpath += '\\\\process.log'\nreturn path;}",
	"on": {
		"down": [
			{
				"type": "email",
				"to": "my.email@mydomain.com"
			}
		],
		"up": [
			{
				"type": "email",
				"to": "my.email@mydomain.com"
			}
		]
	}
});

// Global action configuration (./actions folder)
CSM.addActionSettings('email', {
	"host": "smtp.mydomain.de",
	"user": "noreply",
	"password": "Password",
	"ssl": false,
	"tls": true
});

// Define on error event
CSM.on('error', function (err) {
	console.error(err.stack || err+'');
});

// Start monitoring
CSM.start();
```
