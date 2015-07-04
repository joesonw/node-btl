
module.exports = TagEngine;

function TagEngine() {
	if (!(this instanceof TagEngine)) return new TagEngine();
	this._list = {};
}

TagEngine.prototype.add = function add(name,fn) {
	this._list[name] = fn;
};

TagEngine.prototype.resolve = function resolve(name,ele,context) {
	return this._list[name](ele,context);
};

TagEngine.prototype.has = function has(name) {
	return (name in this._list);
};