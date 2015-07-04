var Assert = require('../assert');

module.exports = TagScriptWait;

function* TagScriptWait(ele,push,context) {
	yield new Promise(function(fulfill,reject) {
		context.fulfill	= function() {
			fulfill();
		};
		context.reject 	= reject;;
		var fn 			= new Function(ele._header);
		fn.call(context);
	});
}
