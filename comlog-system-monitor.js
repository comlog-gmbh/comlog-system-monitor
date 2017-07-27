/**
 * Copyright: COMLOG GmbH
 * User: Anatolij
 * Date: 09.12.2014
 * Time: 15:58
 */
var fs = require("fs"),
	uniqid = require('uniqid'),
	extend = require('util')._extend;

/**
 * Configuration mit Funktionen erweitern
 * @param Service
 * @return {*}
 * @constructor
 */
function ExtendService(Service) {
	Service.statusMail = function(Action, Status) {
		var ComlogMail = require("comlog-sendmail");
		ComlogMail.subject = ""+this.name+" is "+(Status ? 'up' : 'down');
		ComlogMail.text = "Status von "+this.name+" hat sich geändert\n";
		ComlogMail.text += new Date()+"";
		ComlogMail.to = Action.to;
		console.log(ComlogMail.subject);
		ComlogMail.send(function(err, msg) {
			if (err) console.error(err);
		});
	};

	Service.id = uniqid();
	return Service;
}

function ComlogSystemMonitor() {
	require('comlog-event-handler')(this);

	var _this = this,
		_watchers = [],
		_preset = {};

	var toAction = function(opt) {
		if (!opt) return console.info;
		if (opt instanceof Function) return opt;
		try {
			var fullOpt = _preset[opt.type] ?  extend(_preset[opt.type], opt) : opt;
			var Action = new (require('comlog-system-monitor-event-'+opt.type))(fullOpt);
			return function(arg1) {
				Action.start(arg1, function (err) {
					if (err) _this.trigger('error', [err]);
				});
			};
		} catch (e) {
			console.error(e);
			return console.info;
		}
	};

	this.addWatcher = function(options) {
		if (!options) throw new Error("No watcher settings");

		options = ExtendService(options);
		_watchers.push(options);
		return options;
	};

	this.addActionSettings = function (action, settings) {
		_preset[action] = settings;
	};

	this.start = function(cb) {
		if (_watchers.length < 1) {
			cb(new Error("No watchers defined"));
			return;
		}

		for (var i=0; i < _watchers.length; i++) {
			(function (config) {
				try {
					if (config.on) {
						if (config.on.up) {
							if (!(config.on.up instanceof Array)) config.on.up = [config.on.up];
							for(var ai=0; ai < config.on.up.length; ai++) {
								_this.on('up_'+config.id, toAction(config.on.up[ai]));
							}

						}
						if (config.on.down) {
							for(var ai=0; ai < config.on.down.length; ai++) {
								_this.on('down_'+config.id, toAction(config.on.down[ai]));
							}
						}

						delete config.on;
					}
					var WatcherConst = require('comlog-system-monitor-'+config.type.toLowerCase());
					var Watcher = new WatcherConst(config);
					var extra = {};

					Watcher.on('up', function () {
						extra.status = 'up';
						_this.trigger('up_'+Watcher.id, [extend(config, extra)]);
					});
					Watcher.on('down', function () {
						extra.status = 'down';
						_this.trigger('down_'+Watcher.id, [extend(config, extra)]);
					});
					Watcher.start();
				} catch (e) { console.error(e); }
			})(_watchers[i]);
		}
	}
}

module.exports = ComlogSystemMonitor;