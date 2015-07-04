var Assert 	= require('../assert');
var fs		= require('co-fs');


module.exports = TagLoad;

function* TagLoad(ele,push,context) {
	var Parser 	= require('../parser.js');
	var parser = Parser();

	Assert(ele._attributes.src !== undefined,
		'<load> requires src attribute'
	);
	var flag = yield fs.exists(ele._attributes.src);
	Assert(flag,
		'<load> path does not exist on file system'
	);
	var content = yield fs.readFile(ele._attributes.src);
	yield parser.load(content.toString());
	yield parser.render(context,push); 
}
