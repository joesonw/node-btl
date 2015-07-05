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
	this._children 	= [];
	this._engine	= engine;
	this._attributes= {} 
	this._name 		= '';
	this._data		= '';
	this.parse(node,tag);
}
//parse jsdom node on init
Element.prototype.parse = function parse(Node,tag) {
	for (var node of Node._childNodes || Node.childNodes || []) {
		var result = Element(node,this._engine);
		this._children.push(result);
	}
	for (var attrKey in (Node._attributes || {})) {
		if (Node._attributes[attrKey]._nodeValue !== undefined && isNaN(attrKey)) {
			this._attributes[attrKey] = Node._attributes[attrKey]._nodeValue;
		}
	}
	this._data 	= Node._data || '';
	this._tag 	= Node._localName || tag || '__text__';
	this._name 	= Node._name || '';

	//debug(this,Node);
}

Element.prototype.strip = function strip(context,push) {
	var ele 			= {};
	ele.children 		= [];
	for (var e of this._children) {
		ele.children.push(e.strip(context,push));
	}
	ele.tag 			= this._tag;
	ele.data 			= this._data;
	ele.name 			= this._name;
	ele.attributes 		= {};
	ele.__reserved__   	= {
		_engine:this._engine
	};
	for (var attrKey in this._attributes) {
		ele.attributes[attrKey] = parseAttribute(context,this._attributes[attrKey]);
	}
	var self			= this;
	ele.render 			= function* (context,push) {
		var origContext = copy(context);
		yield self.render(origContext,push);
		recoverContext(context,origContext);
	};
	return ele;
};

//parse start executing current node
Element.prototype.render = function *render(context,push) {
	//create virtual context
	var currentContext 	= copy(context);
	var self			= this;
	//create virtual element
	var ele 			= this.strip(context,push);

	if (ele.tag === '__text__') {
		push(ele.data);
	} else if (this._engine.has(ele)){
		yield this._engine.resolve(ele,push,context);
	} else {
		push(handle_tagHeader(ele,context));
		for (var e of ele.children) {
			yield e.render(context,push);
		}
		push(handle_tagFooter(ele,context));
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
	for (var key in result) {
		if (typeof result[key] === 'object') {
			recoverContext(orig[key],result[key]);
		} else if (key.charAt(0) === '$') {
			orig[key.substr(1)] = result[key];
		}
	}
}

function handle_tagHeader(ele,context) {
	if (ele.tag === 'root') {
		return '';
	} else if (ele.name !== '') {
		return '<' + ele.tag + ' ' + ele.name;
	} else {
		var attr=[];
		for (var attrKey in ele.attributes) {
			attr.push(attrKey + '="' + ele.attributes[attrKey]) + '"';
		}
		var attrStr = '';
		if (attr.length!=0) attrStr = ' ' + attr.join(' ');
		return '<' + ele.tag + attrStr + '>';
	}
}

function handle_tagFooter(ele) {
	if (ele.tag === 'root') {
		return '';
	} else if (ele.tag === '!doctype') {
		return '>';
	} else if (ele.name !== '') {
		return '/>';
	} else {
		return '</' + ele.tag+ '>';
	}
}
