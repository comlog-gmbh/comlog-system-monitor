var _email   = require("emailjs");

function eMail(options) {
	this.authentication = null; //'PLAIN', 'LOGIN', 'CRAM-MD5', 'XOAUTH2'
	this.user = null;
	this.password = null;
	this.host = "localhost";
	this.port = null;
	this.ssl = false;
	this.tls = true;
	this.timeout = 5000;
	this.domain = null;

	this.subject = "Service {$name} is {$status}";
	this.text = "Service {$name} status changed to {$status} at {$datetime}";
	this.from = "noreply@localhost";
	this.to = "root@localhost";
	this.attachment = [];

	this.start = function(info, cb) {
		var server = _email.server.connect({
			authentication: this.authentication,
			user: this.user,
			password: this.password,
			host: this.host,
			port: this.port,
			ssl: this.ssl,
			tls: this.tls,
			timeout: this.timeout,
			domain: this.domain
		});

		var opt = {
			text: this.text,
			from: this.from,
			to: this.to,
			subject: this.subject,
			attachment: this.attachment
		};

		info.datetime = (new Date())+'';
		for(var i in info) {
			if (typeof info[i] !== 'string' && typeof info[i] !== 'number') continue;
			opt.text = opt.text.split('{$'+i+'}').join(info[i]);
			opt.subject = opt.subject.split('{$'+i+'}').join(info[i]);
			opt.from = opt.from.split('{$'+i+'}').join(info[i]);
			opt.to = opt.to.split('{$'+i+'}').join(info[i]);
		}

		for(var i in this) {
			if (typeof this[i] !== 'string' && typeof this[i] !== 'number') continue;
			opt.text = opt.text.split('{$'+i+'}').join(this[i]);
			opt.subject = opt.subject.split('{$'+i+'}').join(this[i]);
			opt.from = opt.from.split('{$'+i+'}').join(this[i]);
			opt.to = opt.to.split('{$'+i+'}').join(this[i]);
		}

		server.send(opt, function(err, message) {
			if (cb) cb(err, message);
		});
	};

	if (options) for(var i in options) this[i] = options[i];
}

module.exports = eMail;