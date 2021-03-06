var Xerox = require('xerox');

var Request = new Xerox('Request');
var Response = new Xerox('Response');

var cafescript = require('../index.js');

function equal(test) {
	return function(actual, expected, msg) {
		if(typeof expected == 'object') {
			test.deepEqual(actual, expected, msg);
		} else {
			test.equal(actual, expected, msg);
		}
	};
}

module.exports = {
	error: {
		parse: function(test) {
			test.expect(1);
			test.throws(
				function() {
					var error = require('./fixtures/error/parse.cafe');
				},
				function(error) {
					return error.message == '/home/trevor/Programming/cafescript/test/fixtures/error/parse.cafe:8:11\n\t<$ \'test\' ! error $>\n\t          ^\nUnexpected token !';
				}
			);
			test.done();
		},
		runtime: function(test) {
			test.expect(1);
			var error = require.resolve('./fixtures/error/runtime.cafe');
			test.throws(
				function() {
					cafescript.render(error, { });
				},
				function(err) {
					return err.message == 'hello' &&
						err.stack.split('\n')[1] == '    at ' + error + ':8:11';
				}
			);
			test.done();
		},
		stack: function(test) {
			test.expect(1);
			var stack = require.resolve('./fixtures/error/stack.cafe');
			var runtime = require.resolve('./fixtures/error/runtime.cafe');
			test.throws(
				function() {
					cafescript.render(stack, { });
				},
				function(err) {
					return err.message == 'hello' &&
						err.stack.split('\n')[1] == '    at ' + runtime + ':8:11' &&
						err.stack.split('\n')[4] == '    at ' + stack + ':6:4';
				}
			);
			test.done();
		}
	},
	render: {
		globals: function(test) {
			test.expect(2);
			cafescript.render(require.resolve('./fixtures/test5.cafe'), { title: 'hello' }, function(err, val) {
				test.equal(err, null);
				test.equal(
					val,
					'\n<html>\n\t<head>\n\t\t<title>hello</title>\n\t</head>\n\t<body>\n\t\t<h4>hello</h4>\n\n\t</body>\n</html>\n'
				);
				test.done();
			});
		},
		locals: function(test) {
			test.expect(2);
			cafescript.render(require.resolve('./fixtures/test1.cafe'), { }, function(err, val) {
				test.equal(err, null);
				test.equal(
					val,
					'\n<html>\n\t<head>\n\t\t<title>hello</title>\n\t</head>\n\t<body>\n\t\t<ul> \n\t\t\t<li> \n<h4>0</h4>\n<div> test\n</div>\n\n\n\t\t\t</li> \n\t\t\t<li> \n<h4>1</h4>\n<div> test\n</div>\n\n\n\t\t\t</li> \n\t\t\t<li> \n<h4>2</h4>\n<div> test\n</div>\n\n\n\t\t\t</li> \n\t\t\t<li> \n<h4>3</h4>\n<div> test\n</div>\n\n\n\t\t\t</li> \n\t\t\t<li> \n<h4>4</h4>\n<div> test\n</div>\n\n\n\t\t\t</li> \n\t\t\t<li> \n<h4>5</h4>\n<div> test\n</div>\n\n\n\t\t\t</li> \n\t\t\t<li> \n<h4>6</h4>\n<div> test\n</div>\n\n\n\t\t\t</li> \n\t\t\t<li> \n<h4>7</h4>\n<div> test\n</div>\n\n\n\t\t\t</li> \n\t\t\t<li> \n<h4>8</h4>\n<div> test\n</div>\n\n\n\t\t\t</li> \n\t\t\t<li> \n<h4>9</h4>\n<div> test\n</div>\n\n\n\t\t\t</li> \n\t\t</ul> <div> test\n</div>\n\n\t</body>\n</html>\n'
				);
				test.done();
			});
		}
	},
	require: {
		stdio: function(test) {
/*			var func = require('./fixtures/dir/test3.cafe');
			var _stdout = process.stdout;
			process.stdout = new Xerox.documents.Response();

			Response.copy(equal(test), 'write')
				.expects('<div> ').then()
				.expects('test').then()
				.expects('\n</div>\n');
			func();
			process.stdout = _stdout;
*/			test.done();
		},
		middleware: {
			submodule: function(test) {
				test.expect(109);
				var func = require('./fixtures/test1.cafe');
				var req = new Xerox.documents.Request();
				var res = new Xerox.documents.Response();

				var write = Response.copy(equal(test), 'write')
					// begin test1.cafe
					.expects('').then()
					.expects('\n<html>\n\t<head>\n\t\t<title>').then()
					.expects('hello').then()
					.expects('</title>\n\t</head>\n\t<body>\n\t\t<ul> ').then();
				for(var i = 0; i < 10; i++) {
					write = write
						.expects('\n\t\t\t<li> ').then()
						// begin test2.cafe
						.expects('').then()
						.expects('\n<h4>').then()
						.expects('' + i).then()
						.expects('</h4>\n').then()
						// begin dir/test3.cafe
						.expects('<div> ').then()
						.expects('test').then()
						.expects('\n</div>\n').then()
						// end
						.expects('\n').then()
						// end
						.expects('\n\t\t\t</li> ').then();
				}
				write
					.expects('\n\t\t</ul> ').then()
					// begin dir/test3.cafe
					.expects('<div> ').then()
					.expects('test').then()
					.expects('\n</div>\n').then()
					// end
					.expects('\n\t</body>\n</html>\n');

				Response.print('end').calls(function() {
					test.done();
				});
				func.middleware(req, res);
			},
			reuse: function(test) {
				test.expect(6);
				var func = require('./fixtures/test4.cafe');
				var req;
				var res;

				req = new Xerox.documents.Request();
				req.params = { value: 1 };
				res = new Xerox.documents.Response();
				Response.document(res).copy(equal(test), 'write')
					.expects('<div> ').then()
					.expects('1').then()
					.expects('\n</div>\n');

				Response.print('end');
				func.middleware(req, res);

				req = new Xerox.documents.Request();
				req.params = { value: 2 };
				res = new Xerox.documents.Response();
				Response.document(res).copy(equal(test), 'write')
					.expects('<div> ').then()
					.expects('2').then()
					.expects('\n</div>\n');

				Response.print('end').calls(function() {
					test.done();
				});
				func.middleware(req, res);
			}
		}
	}
};
