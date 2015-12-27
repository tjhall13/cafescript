var path = require('path');
var fs = require('fs');
var vm = require('vm');

var Require = require('./lib/require.js');
var Printer = require('./lib/printer.js');
var parser = require('./lib/cafe.js').parser;

function compile(module, filename) {
	var input = fs.readFileSync(filename, 'utf8');

	parser.yy.text = '';
	parser.yy.symbols = [];
	parser.yy.offset = [];
	parser.parse(input);

	var symbols = parser.yy.symbols;
	var strings = [];
	var	code = '(function(request) {\nprint = __Printer__(this), require = __Require__(this);\n';

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

function environment(module, filename, component) {
	var global = {
		console: console,
		print: null,
		require: null,
		__dirname: path.dirname(filename),
		__filename: path.basename(filename),

		__Printer__: Printer(module, component.strings),
		__Require__: Require(module)
	};
	var options = {
		filename: filename
	};

	return {
		global: global,
		options: options,
		script: component.script
	};
}

function exports(module, filename, env) {
	var func = env.script.runInNewContext(env.global, env.options);
	var output = func.bind(this);
	output.middleware = function(req, res, next) {
		try {
			func.call(res, req);
		} catch(err) {
			console.error(filename + ':', err);
			next(err);
		}
	};

	return output;
}

function load(module, filename) {
	var self = module.parent._$cafe || process.stdout;
	module.exports = exports.call(self,
		module,
		filename,
		environment(
			module,
			filename,
			compile(
				module,
				filename
			)
		)
	);
}

require.extensions['.cafe'] = load;
module.exports = load;
