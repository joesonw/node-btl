module.exports = function(context,val) {
	var getFromContextRegex 	= /<%(.*)%>/gm;
	var executeFromContextRegex = /<%=(.*)%>/gm;
	var result = getFromContextRegex.exec(val);
	if (result) {
		return context[result[1]];
	}
	return val;
};