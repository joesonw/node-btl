var Assert = require('../assert');

module.exports = TagScriptEmbed;

function* TagScriptEmbed(ele,push,context) {
	context.push 	= push;
	var fn 			= new Function(ele._header);
	fn.call(context);
}