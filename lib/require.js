var Module = require('module');
var path = require('path');

module.exports = function(parent, loader) {
	return function(writable) {
		function require(request) {
			var filename = Module._resolveFilename(request, parent);
			if(path.extname(filename) == '.cafe') {
				var module = new Module(filename, parent);
				module._$cafe = writable;
				module.load(filename);
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
};
