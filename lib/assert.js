var assert 		= require('assert');
module.exports = Assert;

function Assert() {
	var result = true;
	for (var i=0;i<arguments.length-1;i++) {
		var a = arguments[i];
		if (Array.isArray(arguments[i])) {
			a = AssertArray(arguments[i]);
		}
		if (!a) {
			result = false;
			break;
		}
	}
	assert(result,arguments[arguments.length-1]);
}

function AssertArray(arr) {
	for (var a of arr) {
		if (a) return true;
	}
	return false;
}