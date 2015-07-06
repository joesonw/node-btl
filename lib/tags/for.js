var Assert		= require('../assert.js');

module.exports = tagFor;

function *tagFor(ele,push,context) {
	Assert(ele.attributes.start != undefined,
		ele.attributes.end != undefined,
		'<for> requires start and end ');
	Assert(!isNaN(ele.attributes.start),
		'<for start need to be a number');
	Assert(!isNaN(ele.attributes.end),
		'<for end need to be a number');

	var start 	= Number(ele.attributes.start);
	var end 	= Number(ele.attributes.end);
	var step = function(iterator) {
		return iterator+=1;
	};

	// parse iterate function
	if (ele.attributes.step !== undefined) {
		var s = ele.attributes.step;
		if (s.charAt(0) === '+') {
			s = s.substr(1);
			Assert(!isNaN(s),
				'<for step need to be a number');
			s = Number(s);
			step = function(i) {
				return i + s;
			}
		}
	}

	var i = start;


	//execute loop
	while (i<end) {
		//append iterator to context
		if (ele.attributes.iterator  !== undefined) {
			context[ele.attributes.iterator] = i;
		} else {
			context.i = i;
		}

		for (var e of ele.children) {
			yield e.render(context,push);
		}

		//retrieve iterator
		if (ele.attributes.iterator !== undefined) {
			i = context[ele.attributes.iterator];
		} else {
			i = context.i;
		}

		i = step(i);
	}
}

