var parseAttribute = require('./parseAttribute');
var co 	 		= require('co');
var	Duplex		= require('stream').Duplex;
var copy		= require('deepcopy');

module.exports = Element;

function debug(that,Node) {
	if (['img','p','h1','!doctype','input'].indexOf(that._tag) !== -1) {
		delete Node._childNodes;
		delete Node._parentNode;
		delete Node._ownerDocument;
		console.log(Node);
	}
}


function Element(node,engine,tag) {
	if (!(this instanceof Element)) return new Element(node,engine,tag);
	this._tag		= '';
	this._header 	= '';
	this._footer 	= '';
	this._children 	= [];
	this._engine	= engine;
	this._attributes= {} 
	this._name 		= '';
	this.parse(node,tag);
}

//parse jsdom node on init
Element.prototype.parse = function parse(Node,tag) {
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
	this._tag = Node._localName || tag;
	this._name= Node._name || '';

	//debug(this,Node);
}

//parse start executing current node
Element.prototype.render = function *render(context,push) {
	//create virtual context
	var currentContext 	= copy(context);
	var self			= this;
	//create virtual element
	var ele 			= {};
	ele.attributes 		= {};
	for (var key in this._attributes) {
		ele.attributes[key] = parseAttribute(currentContext,this._attributes[key]);
	}
	ele.header 			= this._header;
	ele.footer			= this._footer;
	ele.tag 			= this._tag;
	ele.engine 			= this._engine;

	ele.renderChildren 	= function* (renderContext) {
		var origRenderContext= copy(renderContext);
		for (var e of self._children) {
			yield e.render(origRenderContext,push);
			recoverContext(renderContext,origRenderContext);
		}
	};


	if (!this._engine.has(this)) {
		push(handle_tagHeader(this,currentContext));
		for (var ele of this._children) {
			yield ele.render(currentContext,push);
			recoverContext(context,currentContext);
		}
		push(handle_tagFooter(this,currentContext));
	} else {
		yield this._engine.resolve(ele,push,currentContext);
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

function handle_tagHeader(that,context) {
	if (that._tag === 'root') {
		return that._header;
	} else if (that._name !== '') {
		return '<' + that._tag + ' ' + that._name;
	} else {
		var attr=[];
		for (var attrKey in that._attributes) {
			attr.push(attrKey + '="' + parseAttribute(context,that._attributes[attrKey])) + '"';
		}
		var attrStr = '';
		if (attr.length!=0) attrStr = ' ' + attr.join(' ');
		return '<' + that._tag + attrStr + '>' + that._header;
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
