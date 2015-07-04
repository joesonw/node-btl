var Readable    	= require('stream').Readable;
var Assert      	= require('./assert');
var inherits    	= require('util').inherits;
var co            	= require('co');
var fs             	= require('co-fs');

module.exports = Pagelet;

function Pagelet(config) {
	config = config || {};
	this.onerror    		= config.onerror || this.onerror;
	this.children   		= config.children || [];
	this.header             = config.header || '';
	this.footer             = config.footer || '';
	this.body               = config.body || '';
	if (config.top) {
		this.readable   	= new Readable;
		this.readable._read = this._read;
	}
	if (config.controller) {
		this.set('controller',config.controller);
	}
	if (config.postController) {
		this.set('postController',config.postController);
	}
}

Pagelet.prototype._read = function _read() {};

Pagelet.prototype.render = function render() {
	co.call(this,this.execute).catch(this.onerror);
	return this.readable;
};

Pagelet.prototype.renderSync = function* renderSync() {
	yield this.execute();
	return this.readable;
}

Pagelet.prototype.execute = function* execute(readable,context) {
	readable = this.readable || readable;
	readable.push(this.header);
	context = context || {};

	if (this.controller) {
		var e = this.controller();
		Assert(e,e.constructor.name === 'GeneratorFunction','Pagelet.controller() should return a GeneratorFunction');
		yield e(context);
	}	

	readable.push(this.body);

	if (this.postController) {
		var e = this.postController();
		Assert(e,e.constructor.name === 'GeneratorFunction','Pagelet.postController() should return a GeneratorFunction');
		yield e(context);
	}	

	for (var child of this.children) {
		yield child.execute(readable,context);
	}

	readable.push(this.footer);

	if (this.readable) readable.push(null);
};

/**
 * add a child to this template
 */
Pagelet.prototype.add = function add(child) {
	Assert(child,
		child instanceof Pagelet,
		'Pagelet.add() requires a Pagelet instance');
	this.children.push(child);
};

Pagelet.prototype.set = function set(key,value) {
	var val = value;
	Assert(['onerror','chidlren','header','footer','controller','body'].indexOf(key)!==-1,
		'Pagelet.set() requires a valid key [onerror,chidlren,header,footer,controller,body');
	if (key === 'controller' ||
		key === 'postController') {
		if (value && value.constructor.name === 'GeneratorFunction') {
			val = function () { 
				return value;
			};
		}
	}
	this[key] = val;
};

Pagelet.prototype.onerror = function onerror(err) {
	var msg = err.stack || err;
	console.error('');
	console.error(msg.replace(/^/gm,'  '));
	console.error('');
};
