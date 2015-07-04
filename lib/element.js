var co 	 		= require('co');
var	Duplex		= require('stream').Duplex;
var copy		= require('deepcopy');

module.exports = Element;

function Element(node,engine,tag) {
	if (!(this instanceof Element)) return new Element(node,engine,tag);
	this.tag		= '';
	this._header 	= '';
	this._footer 	= '';
	this._children 	= [];
	//this.Duplex 	= new Duplex();
	this._engine	= engine;
	this._attributes= {} 
	this.parse(node,tag);
}

Element.prototype.parse = function parse(Node,tag) {
	for (var node of Node._childNodes || Node.childNodes || []) {
		if (node._localName === undefined) {
			if (this._header) this._footer = node._data || '';
			else			  this._header = node._data || '';
		} else {
			var result = Element(node,this._engine);
			if (result.tag != 'undefined') {
				this._children.push(result);
			}
		}
	}
	for (var attrKey in (Node._attributes || {})) {
		if (Node._attributes[attrKey]._nodeValue) {
			this._attributes[attrKey] = Node._attributes[attrKey]._nodeValue;
		}
	}
	this.tag = Node._localName || tag;
}

Element.prototype.stream = function stream() {

};

Element.prototype.render = function render(context) {
	conetxt = context || {};
	var currentContext = copy(context);
	if (!this._engine.has(this.tag)) {
		var result = '';
		if (this.tag !== 'root')
			result += '<' + this.tag + '>';
		result += this._header;
		for (var ele of this._children) {
			result += ele.render(currentContext);
		}
		if (this.tag !== 'root') result += '</' + this.tag + '>';
		result += this._footer;
		return result;
	} else {
		return this._engine.resolve(this.tag,this,currentContext);
	}
};