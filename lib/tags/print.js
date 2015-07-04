var Assert 	= require('../assert');

module.exports = TagPrint;

function* TagPrint(ele,push,context) {
	Assert(ele._attributes.name !== undefined,
		'<print> must have name attribtue');
	push((context[ele._attributes.name] || '').toString());
}