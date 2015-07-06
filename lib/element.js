var parseAttribute = require('./parseAttribute');
var co 	 		= require('co');
var	Duplex		= require('stream').Duplex;
var copy		= require('deepcopy');
var _ 			= require('underscore');

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
	ele.attributes 		= this._attributes;
	ele.__reserved__   	= {
		_engine:this._engine
	};
	var self			= this;
	ele.render 			= function* (context,push) {
		yield self.render(context,push);
	};
	return ele;
};

//parse start executing current node
Element.prototype.render = function *render(context,push) {

	var virtualContext = copy(context);	
	//create virtual context
	var self			= this;
	//create virtual element
	var ele 			= this.strip(context,push);


	if (ele.attributes.controller) {
		if (this._engine.hasController(ele.attributes.controller)) {
			yield this._engine.resolveController(ele.attributes.controller,ele,push,virtualContext);
		}
	}
	ele.attributes = {};
	for (var attrKey in this._attributes) {
		ele.attributes[attrKey] = execInline(this._attributes[attrKey],virtualContext);
	}

	if (ele.tag === '__text__') {
		push(execInline(ele.data,virtualContext));
	} else if (this._engine.hasTag(ele)) {
		yield this._engine.resolveTag(ele,push,virtualContext)
	} else {
		push(handle_tagHeader(ele,virtualContext));
		for (var e of ele.children) {
			yield e.render(virtualContext,push);
		}
		push(handle_tagFooter(ele,virtualContext));
	}
	recoverContext(context,virtualContext);
};

function execInline(content,context) {
	var getFromContextRegex 	= /{{=([^}]+)}}/gm;
	var result = content.match(getFromContextRegex);
	result  = _.uniq(result);
	var envStr 		= '';
	/*for (var key in context) {
		if (key == 'push') continue;
		var val = context[key];
		if (typeof val === 'string') {
			envStr += 'var ' + key + '="' + context[key] +'";\n';
		} else if (typeof val === 'object') {
			envStr += 'var ' + key + '=' + JSON.stringify(val,false,4) +';\n';
		} else if (typeof val === 'number') {
			envStr += 'var ' + key + '=' + context[key] +';\n';
		}
	}*/
	var replacement = {};
	for (var exp of result) {
		var key  	= exp;
		exp 		= exp.substr(3,exp.length-5);
		//var	fnStr	= envStr;
		var fnStr	= 'return ' + exp;
		var fn 		= new Function(fnStr);
		replacement[key] = fn.call(context);
	}
	for (var key in replacement) {
		while (content.indexOf(key) !== -1) {
			content = content.replace(key,replacement[key]);
		}
	}
	return content;

}

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
		if (key.charAt(0) === '$') {
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
			attr.push(attrKey + '="' + ele.attributes[attrKey] + '"');
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

