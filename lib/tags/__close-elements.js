module.exports = function* (ele,push,context) {
	var attr = [];
	for(var a in ele.attributes) {
		attr.push(a + '="' + ele.attributes[a] + '"');
	}
	var str = '';
	if (attr.length !== 0) str = ' ' + attr.join(' ');
	push('<' + ele.tag + str + '/>');
}