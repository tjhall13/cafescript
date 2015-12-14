var Module = require('module');
var path = require('path');
var fs = require('fs');
var vm = require('vm');

var Directed = require('./lib/directed.js');
var printer = require('./lib/printer.js');
var parser = require('./lib/cafe.js').parser;

function load(filename, parent) {
	var _filename = Module._resolveFilename(filename, parent);
	var _module = new Module(_filename, parent);
	_module.filename = _filename;
	_module.paths = Module._nodeModulePaths(path.dirname(filename));
	return _module;
}

function compile(module, filename, stream, middleware) {
	function require(path) {
		return module.require(path);
	}
	require.resolve = function(request) {
		return Module._resolveFilename(request, module);
	};
	require.cache = Module._cache;

	var input = fs.readFileSync(filename, 'utf8');

	parser.yy.text = '';
	parser.yy.symbols = [];
	parser.yy.offset = [];
	parser.parse(input);

	var symbols = parser.yy.symbols;
	var strings = [];
	var code;

	if(middleware) {
		code = '(function(request) {';
	} else {
		code = '(function() {';
	}
	for(var i = 0; i < symbols.length; i++) {
		if(!symbols[i].string) {
			symbols[i].string = '';
		}
		if(!symbols[i].code) {
			symbols[i].code = '';
		}
		strings.push(symbols[i].string);
		code += '\nprint.__strings__(' + i + ');\n' + symbols[i].code;
	}
	code += '});';

	var print = printer(stream);
	print.__strings__ = function(i) {
		this.write(strings[i]);
	};

	var script = new vm.Script(code);
	var global = {
		print: print,
		request: { },
		require: require,
		console: console,
		__dirname: path.dirname(filename),
		__filename: path.basename(filename)
	};
	var options = {
		filename: filename
	};

	var func = script.runInNewContext(global, options);
	module.exports = func;

	return module.exports;
}

require.extensions['.cafe'] = function(module, filename) {
	var stream = process.stdout;
	if(module.parent._$cafe) {
		module._$cafe = module.parent._$cafe;
		stream = module._$cafe;
	}
	compile(module, filename, stream, false);
};

module.exports = {
	middleware: function(filename, parent) {
		var _module = load(filename, parent);
		var _stream = new Directed();

		_module._$cafe = _stream;
		var run = compile(_module, _module.filename, _stream, true);
		return function(req, res, next) {
			_stream.direct(res);
			try {
				run(req);
				_stream.release();
			} catch(err) {
				next(err);
			}
		};
	}
};
