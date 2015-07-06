##Description

This is a template language aimed for bigpipe with async support

Template is parsed line by line.

No more messed-up&splitted-everywhere modules needed.

Write bigpipe in pure html

##Example

###Template

```html
<!doctype html>
<html>
	<head>
		<title>Hello World</title>
	</head>
	<body>
		asdljaksdjaslk
		<img src="https://dn-cnode.qbox.me/FtG0YVgQ6iginiLpf9W4_ShjiLfU"/>
		<script wait>
			var that = this;
			this.axios.get('https://apiv2-test.517.today/public/region').then(function(response) {
				that.$regions = response.data.data;
				that.fulfill();
			}).catch(function(err) {
				throw err;
			})
		</script>>
		<for start="0" end="{{=this.regions.length}}">
			<p>{{=this.regions[this.i].name}}</p>
		</for>	
		<load src="./sub.html"></load>
	</body>
</html>
```

###NodeJs

```js
	var koa 	= require('koa');
	var fs		= require('fs');
	var Parser  = require('./lib/parser');
	var co 		= require('co');
	var app 	= koa();
	var html 	= fs.readFileSync('you file');

	var parser 	= Parser();

	co(function*() {
		yield parser.load(html);
		app.use(function* () {
			this.type = 'html';
			this.body = parser.stream();
		});
	});
	
	app.listen(3000);

```

##Customization

###Add custom tag

```js

parser.addTag('MyTag',function* (ele,push,context) {
	push('<p>This is a test tag</p>');
});

```

##Contribution Notes

If you are implementing a new tag, please put it under `./lib/tags` folder

If it extends existing html tag, name the file like `script-wait.js`

