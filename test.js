var koa	 	= require('koa');
var Pagelet = require('./lib/pagelet');

var fs		= require('fs');
var Parser  = require('./lib/parser');
var co 		= require('co');

sleep = function sleep(n) {
	return new Promise(function(accept) {
		setTimeout(accept,n);
	});
};
function sleep(n) {
	return new Promise(function(accept) {
		setTimeout(accept,n);
	});
}

var app = koa();

var parser = Parser();
var f = fs.readFileSync('./test.html').toString();

var cluster = require('cluster');

co(function* () {
	yield parser.load(f);
	app.use(function* () {
		this.type = 'html';
		this.body = parser.stream();
	});
	app.listen(3000);
	console.log('on 3000');
}).then(function() {

}).catch(function(err) {
	console.error(err.stack);
})

