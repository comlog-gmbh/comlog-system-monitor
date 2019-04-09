#!/usr/bin/env node

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var path = require('path'),
	fs = require('fs'),
	configPaths = [process.argv[2], process.cwd() + path.sep + 'config.json', path.dirname(process.cwd()) + path.sep + 'config.json', process.cwd() + path.sep + 'config.js', path.dirname(process.cwd()) + path.sep + 'config.js'],
	configFile = null,
    log4js = require('log4js'),
	path = require('path'),
	os = require('os'),
    open = require('open')
    ;
    
var logfile = process.cwd()+path.sep+'comlog-system-monitor.log';

log4js.configure({
	appenders: { 
		'everything': { 
			type: 'file', 
			filename: logfile, 
			maxLogSize: 10485760, 
			backups: 3
		},
		console: { type: 'console' }
	},
	categories: { default: { appenders: ['everything', 'console'], level: 'debug' } }
});
var logger = log4js.getLogger('everything');

// Systray
try {
    var icon_file = __dirname+path.sep;
    if (os.platform() == 'win32') {
        icon_file += 'icon.ico';
    } else {
        icon_file += 'icon.png';
    }
    var icon_data = fs.readFileSync(icon_file);
    icon_data = Buffer.from(icon_data).toString('base64');
    
    var SysTray = require('systray');
    var systray = new SysTray.default({
        menu: {
            // you should using .png icon in macOS/Linux, but .ico format in windows
            icon: icon_data,
            title: "Comlog System Monitor",
            tooltip: "Comlog System Monitor",
            items: [{
                title: "Open log file",
                tooltip: "",
                checked: false,
                enabled: true
            }, {
                title: "Exit",
                tooltip: "",
                checked: false,
                enabled: true
            }]
        },
        debug: false,
        copyDir: true // copy go tray binary to outside directory, useful for packing tool like pkg.
    });

    systray.onClick(function(action) {
        if (action.seq_id === 0) {
            open(path.dirname(logfile));
        }
        else if (action.seq_id === 1) {
            logger.info('Exiting by user');
            systray.kill();
            process.exit(0);
        }
    });

} catch(e) { logger.error(e.stack || e+''); };

// Read config
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
	logger.error('No config file specifed!');
    if (typeof systray != 'undefined') systray.kill();
    process.exit(2);
}

var Config = require(configFile);

var CSM = new (require('../comlog-system-monitor.js'))({logger: logger});

for(var i=0; i < Config.watcher.length; i++) {
	CSM.addWatcher(Config.watcher[i]);
}

for(var i in Config.action) {
	CSM.addActionSettings(i, Config.action[i]);
}

CSM.on('error', function (err) {
    logger.error(err.stack || err+'');
});

CSM.start();