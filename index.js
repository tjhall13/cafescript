var Module = require('module');

var Environment = require('./lib/environment.js');
var StringStream = require('./lib/stringstream.js');

function loader(module, filename) {
	var env = new Environment(module, filename);

	var exports = function() {
		var _$cafe = module._$cafe || { res: process.stdout };
		env.run(_$cafe, arguments);
	};
	exports.middleware = function(req, res, next) {
		try {
			env.run({
				res: res,
				global: {
					request: req
				}
			});

			res.end();
		} catch(err) {
			next(err);
		}
	};

	module.exports = exports;
}

require.extensions['.cafe'] = loader;
module.exports = {
	render: function(filename, global, callback) {
		if(filename in Environment._cache) {
			env = Environment._cache[filename];
		} else {
			var mod;

			if(filename in Module._cache) {
				mod = Module._cache[filename];
			} else {
				mod = new Module(filename, module.parent);
				mod.load(filename);
				Module._cache[filename] = mod;
			}

			env = new Environment(mod, filename);
			Environment._cache[filename] = env;
		}

		var stream = new StringStream('');

		stream.on('error', function(err) {
			callback(err, null);
		});
		stream.on('finish', function() {
			callback(null, stream.val());
		});

		env.run({
			res: stream,
			global: global
		});

		stream.end();
	}
};
