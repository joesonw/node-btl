var jsdom		= require('jsdom');
var Element		= require('./element');
var TagEngine	= require('./tagEngine');
var Assert 		= require('./assert');

var tagFor 		= require('./tags/for.js');

module.exports = Parser;


function Parser() {
	if (!(this instanceof Parser)) return new Parser();
	this._tagEngine = TagEngine();
	this._tagEngine.add('for',tagFor);
	this._nodes = [];
}

Parser.prototype.addTag = function addTag(name,fn) {
	this._tagEngine.add(name,fn);
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

Parser.prototype.render = function render(context) {
	return this._root.render(context);
};
