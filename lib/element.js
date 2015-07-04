var co 	 		= require('co');
var	Duplex		= require('stream').Duplex;
var copy		= require('deepcopy');

module.exports = Element;


function Element(node,engine,_tag) {
	if (!(this instanceof Element)) return new Element(node,engine,_tag);
	this._tag		= '';
	this._header 	= '';
	this._footer 	= '';
	this._children 	= [];
	this._engine	= engine;
	this._attributes= {} 
	this._name 		= '';
	this.parse(node,_tag);
}

//parse jsdom node on init
Element.prototype.parse = function parse(Node,_tag) {
	for (var node of Node._childNodes || Node.childNodes || []) {
		if (node._localName === undefined) {
			if (this._header) this._footer = node._data || '';
			else			  this._header = node._data || '';
		} else {
			var result = Element(node,this._engine,undefined);
			if (result._tag != 'undefined') {
				this._children.push(result);
			}
		}
	}
	for (var attrKey in (Node._attributes || {})) {
		if (Node._attributes[attrKey]._nodeValue !== undefined && isNaN(attrKey)) {
			this._attributes[attrKey] = Node._attributes[attrKey]._nodeValue;
		}
	}
	this._tag = Node._localName || _tag;
	this._name= Node._name || '';
}

//parse start executing current node
Element.prototype.render = function *render(context,push) {
	//create virtual context
	var currentContext = copy(context);

	if (!this._engine.has(this)) {
		push(handle_tagHeader(this));
		for (var ele of this._children) {
			yield ele.render(currentContext,push);
			recoverContext(context,currentContext);
		}
		push(handle_tagFooter(this));
	} else {
		yield this._engine.resolve(this,push,currentContext);
		recoverContext(context,currentContext);
	}
};

function recoverContext(orig,result) {
	if (orig === null || result === null) return
	if (typeof orig !== 'object' || typeof result !== 'object') return;
	for (var key in orig) {
		if (typeof orig[key] === 'object') {
			recoverContext(orig[key],result[key]);
		} else {
			orig[key] = result[key];
		}
	}
}

function handle_tagHeader(that) {
	if (that._tag === 'root') {
		return that._header;
	} else if (that._name !== '') {
		return '<' + that._tag + ' ' + that._name;
	} else {
		var attr=[];
		for (var attrKey in that._attributes) {
			attr.push(attrKey + '="' + that._attributes[attrKey]);
		}
		return '<' + that._tag + ' ' + attr.join(' ') + '>' + that._header;
	}
}

function handle_tagFooter(that) {
	if (that._tag === 'root') {
		return that._footer;
	} else if (that._tag === '!doctype') {
		return '>';
	} else if (that._name !== '') {
		return '/>';
	} else {
		return that._footer + '</' + that._tag+ '>';
	}
}
