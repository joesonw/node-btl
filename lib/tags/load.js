var Assert 	= require('../assert');
var fs		= require('co-fs');
var jsdom	= require('jsdom');
var Element	= require('../element');


module.exports = TagLoad;

function* TagLoad(ele,push,context) {

	Assert(ele.attributes.src !== undefined,
		'<load> requires src attribute'
	);
	var flag = yield fs.exists(ele.attributes.src);
	Assert(flag,
		'<load> path does not exist on file system'
	);
	var content = yield fs.readFile(ele.attributes.src);
	var element = yield new Promise(function(fulfill,reject) {
		jsdom.env(content.toString(),[],function(err,window) {
			if (err) return reject(err);
			var html = window.document.childNodes[0];
			var body = html._childNodes[1];
			var e= body._childNodes[0];
			fulfill(Element(e,ele.__reserved__._engine));
		});
	});

	yield element.render(context,push); 
}
