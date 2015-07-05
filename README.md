##Description

This is a template language aimed for bigpipe with async support

Template is parsed line by line.

No more messed-up&splitted-everywhere modules needed.

Write bigpipe in pure html

##Example

###Template

```html
	<html>
		<head>
			<title>Hello World</title>
		</head>
		<body>
			<script embed>
				this.$end = 10; // do not clear up after exiting context.
			</script>
			<for start='0' end='{{end}}' step='+2' iterator='j'>
				<script wait>
					this.j++;
					setTimeout(this.fulfill,2000) //2000ms
				</script>
				<p> Aloha!!!!, {{j}}</p>
			</for>	
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

