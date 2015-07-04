var Assert		= require('../assert.js');

module.exports = tagFor;

function *tagFor(ele,push,context) {
	Assert(ele._attributes.start != undefined,
		ele._attributes.end != undefined,
		'<for> requires start and end ');
	Assert(!isNaN(ele._attributes.start),
		'<for start need to be a number');
	Assert(!isNaN(ele._attributes.end),
		'<for end need to be a number');

	var start 	= Number(ele._attributes.start);
	var end 	= Number(ele._attributes.end);
	var step = function(i) {
		return i++;
	};

	// parse iterate function
	if (ele._attributes.step) {
		var s = ele._attributes.step;
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
		if (ele._attributes.iterator) {
			context[ele._attributes.iterator] = i;
		} else {
			context.i = i;
		}

		push(ele._header);
		for (var e of ele._children) {
			yield e.render(context,push);
		}
		//retrieve iterator
		if (ele._attributes.iterator) {
			i = context[ele._attributes.iterator];
		} else {
			i = context.i;
		}

		push(ele._footer);
		i = step(i);
	}
}

