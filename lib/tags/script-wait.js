var Assert = require('../assert');

module.exports = TagScriptWait;

function* TagScriptWait(ele,push,context) {
	yield new Promise(function(fulfill,reject) {
		context.fulfill	= function() {
			fulfill();
		};
		context.reject 	= reject;
		var fn 			= new Function(ele.children[0].data);
		fn.call(context);
	});
}
