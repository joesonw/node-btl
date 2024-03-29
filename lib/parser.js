var jsdom		= require('jsdom');
var Element		= require('./element');
var TagEngine	= require('./tagEngine');
var Assert 		= require('./assert');
var Readable 	= require('stream').Readable;
var co 			= require('co');

var tagFor 			= require('./tags/for.js');
var tagScriptWait 	= require('./tags/script-wait.js');
var tagScriptEmbed	= require('./tags/script-embed.js');
var tagPrint		= require('./tags/print.js');
var tagLoad			= require('./tags/load.js');
var tagForeach 		= require('./tags/foreach.js');
var __closeTag      = require('./tags/__close-elements');

module.exports = Parser;

function _read() {}

function Parser(onerror) {
	if (!(this instanceof Parser)) return new Parser(onerror);
	this._tagEngine 		= TagEngine();
	this._register();
	this._nodes 			= [];
	this._onerror			= onerror || this.onerror;
}

Parser.prototype.addTag = function addTag(name,fn) {
	this._tagEngine.addTag(name,fn);
};

Parser.prototype.addController = function addController(name,fn) {
	this._tagEngine.addController(name,fn);	
}

Parser.prototype._register = function _register() {
	this._tagEngine.addTag('for',tagFor);
	this._tagEngine.addTag('script-wait',tagScriptWait);
	this._tagEngine.addTag('script-embed',tagScriptEmbed);
	this._tagEngine.addTag('print',tagPrint);
	this._tagEngine.addTag('load',tagLoad);
	this._tagEngine.addTag('foreach',tagForeach);

	this._tagEngine.addTag('img',__closeTag);
	this._tagEngine.addTag('input',__closeTag);
};

Parser.prototype.load = function load(content,dep) {
	var self = this;
	dep = dep || [];
	return new Promise(function(fulfill,reject) {
		jsdom.env(content,dep,function(err,window) {
			if (err) return reject(err);
			self._root = Element(window.document,self._tagEngine,'root');
			fulfill();
		});
	});
};

Parser.prototype.toString = function toString() {
	return JSON.stringify(this._root,false,2);
};

Parser.prototype.stream = function render(context) {
	var self 		= this;
	var readable 	= new Readable();
	readable._read 	= function() {};
	context 		= context || {};
	co.call(this,this._root.render(context,readable.push.bind(readable))).catch(this.onerror).then(function() {
		readable.push(null);
	})
	return readable;
};

Parser.prototype.render = function* render(context,push) {
	context 		= context || {};
	yield this._root.render(context,push);
};

Parser.prototype.onerror = function onerror(err) {
	var msg = err.stack || err.toString();
	console.error('')
	console.error(msg.replace(/^/gm,'  '));
	console.error('');
};


