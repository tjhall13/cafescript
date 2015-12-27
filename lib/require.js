var Module = require('module');

module.exports = function(_module) {
	return function(writable) {
		function require(path) {
			_module._$cafe = writable;
			return _module.require(path);
		}
		require.resolve = function(request) {
			return Module._resolveFilename(request, _module);
		};
		require.cache = Module._cache;

		return require;
	};
};
