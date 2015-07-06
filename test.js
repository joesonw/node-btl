var koa	 	= require('koa');
var Pagelet = require('./lib/pagelet');

var fs		= require('fs');
var Parser  = require('./lib/parser');
var co 		= require('co');
var axios	= require('axios');

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
parser.addController('loop',function* (ele,push,context) {
	var response = yield axios.get('https://apiv2-test.517.today/public/region');
	context.regions = response.data.data;
})

co(function* () {
	yield parser.load(f);
	/*app.use(function* () {
		this.type = 'html';
		this.body = parser.stream({axios:axios});
	});
	app.listen(8081);
	console.log('on 3000');*/
	parser.stream({axios:axios}).pipe(process.stdout);
}).then(function() {

}).catch(function(err) {
	console.error(err.stack);
})

