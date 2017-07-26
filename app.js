/**
 * Copyright: COMLOG GmbH
 * User: Anatolij
 * Date: 09.12.2014
 * Time: 15:58
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var Config = require('./config.json'),
	i;

var CSM = new (require('./comlog-system-monitor.js'))();

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