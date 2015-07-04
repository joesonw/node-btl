var Assert = require('./assert');
module.exports = _tagEngine;

function _tagEngine() {
	if (!(this instanceof _tagEngine)) return new _tagEngine();
	this._list = {};
}

_tagEngine.prototype.add = function add(name,fn) {
	Assert(fn,
		fn.constructor.name === 'GeneratorFunction',
		'_tagEngine.add() accepts GeneratorFunction only');
	this._list[name] = fn;
};

_tagEngine.prototype.resolve = function *resolve(ele,push,context) {
	var fn;
	if (ele.tag in this._list) fn = this._list[ele.tag];
	for (attr in ele.attributes) {
		if ((ele.tag + '-' + attr) in this._list)
			fn = this._list[ele.tag + '-' + attr];
	}
	yield fn(ele,push,context);
};

_tagEngine.prototype.has = function has(ele) {
	if (ele._tag in this._list) return true;
	for (attr in ele._attributes) {
		if ((ele._tag + '-' + attr) in this._list) {
			return true;
		}
	}
	return false;
};