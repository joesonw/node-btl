var koa	 	= require('koa');
var Pagelet = require('./lib/pagelet');

var ejs		= require('ejs');
var fs		= require('fs');
var jsdom	= require('jsdom');
var cheerio = require('cheerio')
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

var f = fs.readFileSync('./test.html').toString();
var parser = Parser();
co(function* () {
	yield parser.load(f);
	console.log(parser.render({test:'hello'}));
	//console.log(parser.toString());
}).then(function(r) {
	console.log(r);
}).catch(function(err) {
	console.error(err.stack);
})


app.use(function* () {

	/*var p1 = new Pagelet({
		top: true
	});
	p1.set('header','<!DOCTYPE html><html><head><title>Hello world</title></head><body>');
	p1.set('body','<h1>Loading...</h1>');
	p1.set('footer','</body>');
	p1.set('controller',function* (context) {
		context.childrenData ='asd';
	})

	var p2 = new Pagelet();
	p2.set('body',{
		type:'jade',
		path:'./test.jade',
		options:{}
	});
	p2.set('controller',function* (context) {
		yield sleep(3000);
		context.msg = 'hello world';
	});
		
	p1.add(p2);
		
	this.type = 'html';
	this.body = p1.render();*/

});


//app.listen(8083);