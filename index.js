var Module = require('module');
var path = require('path');
var fs = require('fs');
var vm = require('vm');

var Directed = require('./lib/directed.js');
var printer = require('./lib/printer.js');
var parser = require('./lib/cafe.js').parser;

function compile(module, filename) {
	var input = fs.readFileSync(filename, 'utf8');

	parser.yy.text = '';
	parser.yy.symbols = [];
	parser.yy.offset = [];
	parser.parse(input);

	var symbols = parser.yy.symbols;
	var strings = [];
	var	code = '(function(request) {';

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
	var script = new vm.Script(code);

	return {
		script: script,
		strings: strings
	};
}

function environment(module, filename, strings, middleware) {
	function require(path) {
		return module.require(path);
	}
	require.resolve = function(request) {
		return Module._resolveFilename(request, module);
	};
	require.cache = Module._cache;

	var print;
	if(middleware) {
		print = printer(middleware);
	} else {
		print = printer(module._$cafe);
	}
	print.__strings__ = function(i) {
		this.write(strings[i]);
	};
	var global = {
		print: print,
		require: require,
		console: console,
		__dirname: path.dirname(filename),
		__filename: path.basename(filename)
	};
	var options = {
		filename: filename
	};

	return {
		global: global,
		options: options,
		middleware: middleware
	};
}

function exporter(module, script, env) {
	var func;
	if(env.middleware) {
		// middleware
		var run = script.runInNewContext(env.global, env.options);
		func = function(req, res, next) {
			module._$cafe = env.middleware;
			env.middleware.direct(res);
			try {
				run(req);
				env.middleware.release();
			} catch(err) {
				next(err);
			}
			module._$cafe = process.stdout;
		};
	} else {
		// module
		func = script.runInNewContext(env.global, env.options);
	}

	return func;
}

require.extensions['.cafe'] = function(module, filename) {
	if(module.parent._$cafe) {
		module._$cafe = module.parent._$cafe;
	} else {
		module._$cafe = process.stdout;
	}
	var component = compile(module, filename);
	var local = environment(module, filename, component.strings);
	var middleware = environment(module, filename, component.strings, new Directed());

	module.exports = exporter(module, component.script, local);
	module.exports.middleware = exporter(module, component.script, middleware);
};
