var Xerox = require('xerox');

var Request = new Xerox('Request');
var Response = new Xerox('Response');
var Module = new Xerox('Module');

var load = require('../index.js');

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
	load: function(test) {
		test.expect(2);
		var _module = new Xerox.documents.Module();
		_module.id = 'test1.cafe';
		_module.parent = { };
		_module.require = require;
		load(_module, require.resolve('./test1.cafe'));
		var value = _module.exports;
		test.equal(typeof value, 'function');
		test.equal(typeof value.middleware, 'function');
		test.done();
	},
	require: {
		stdio: function(test) {
/*			var func = require('./dir/test3.cafe');
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
				var func = require('./test1.cafe');
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
				var func = require('./test4.cafe');
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
