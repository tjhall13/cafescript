var Module = require('module');
var path = require('path');

function Require(parent) {
	this.require = function(ctx) {
		function require(request) {
			var filename = Module._resolveFilename(request, parent);
			if(path.extname(filename) == '.cafe') {
				var module;
				if(filename in Module._cache) {
					module = Module._cache[filename];
				} else {
					module = new Module(filename, parent);
					module.load(filename);
					Module._cache[filename] = module;
				}
				module._$cafe = ctx;
				return module.exports;
			} else {
				return parent.require(request);
			}
		}
		require.resolve = function(request) {
			return Module._resolveFilename(request, parent);
		};

		return require;
	};
}

module.exports = Require;
