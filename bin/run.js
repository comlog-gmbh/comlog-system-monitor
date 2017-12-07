#!/usr/bin/env node

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var path = require('path'),
	fs = require('fs'),
	configPaths = [process.argv[2], process.cwd() + path.sep + 'config.json', path.dirname(process.cwd()) + path.sep + 'config.json', process.cwd() + path.sep + 'config.js', path.dirname(process.cwd()) + path.sep + 'config.js'],
	configFile = null;

while(configPaths.length > 0) {
	var p = configPaths.shift(), Stats;
	try {
		Stats = fs.statSync(p);
		if (Stats.isFile()) {
			configFile = p;
			break;
		}
	} catch (e) {}
}

if (!configFile) {
	console.error('No config file specifed!');
	process.exit(2);
}

var Config = require(configFile);
var CSM = new (require('../comlog-system-monitor.js'))();

for(var i=0; i < Config.watcher.length; i++) {
	CSM.addWatcher(Config.watcher[i]);
}

for(var i in Config.action) {
	CSM.addActionSettings(i, Config.action[i]);
}

CSM.on('error', function (err) {
	console.error(err.stack || err+'');
});

CSM.start();