var koa	 	= require('koa');
var Pagelet = require('./lib/pagelet');

var fs		= require('fs');
var Parser  = require('./lib/parser');
var co 		= require('co');

global.sleep = function sleep(n) {
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
co(function* () {
	yield parser.load(f);
	parser.stream().pipe(process.stdout);
	//console.log(parser.toString());
}).then(function() {

}).catch(function(err) {
	console.error(err.stack);
})


app.use(function* () {
	var f = fs.readFileSync('./test.html').toString();
	yield parser.load(f);
		
	this.type = 'html';
	this.body = parser.stream();

});


app.listen(3000);