var Assert 		= require('../assert.js');

module.exports  = tagForeach;

function* tagForeach(ele,push,context) {
	Assert(ele.attributes.in !== undefined,
		'<foreach> requires in');

	var items = context[ele.attributes.in];
	Assert(items !== undefined,
		'<foreach> in is not defined');


	for (var i of items) {
		if (ele.attributes.iterator) {
			context[ele.attributes.iterator] = i;
		} else {
			context.i=i;
		}
		for (var e of ele.children) {
			yield e.render(context,push);
		}

	}

}