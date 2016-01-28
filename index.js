var path = require('path');
var fs = require('fs');
var vm = require('vm');

var Require = require('./lib/require.js');
var Printer = require('./lib/printer.js');
var StringStream = require('./lib/stringstream.js');

var parser = require('./lib/cafe.js').parser;

function compile(module, filename) {
	var input = fs.readFileSync(filename, 'utf8');

	parser.yy.text = '';
	parser.yy.symbols = [];
	parser.yy.offset = [];
	parser.parse(input);

	var symbols = parser.yy.symbols;
	var strings = [];
	var	code = '(function(request) {\nvar print = __Printer__(this), require = __Require__(this);\n';

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
		__dirname: path.dirname(filename),
		__filename: path.basename(filename),

		__Printer__: Printer(module, component.strings),
		__Require__: Require(module, loader)
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

var cache = { };

function exports(module, filename, env, stream) {
	var func;
	if(module.id in cache) {
		func = cache[module.id];
	} else {
		func = env.script.runInNewContext(env.global, env.options);
		cache[module.id] = func;
	}
	var output = func.bind(stream);
	output.middleware = function(req, res, next) {
		try {
			func.call(res, req);
			res.end();
		} catch(err) {
			next(err);
		}
	};

	return output;
}

function loader(module, filename) {
	var stream = module._$cafe || process.stdout;
	module.exports = exports(
		module,
		filename,
		environment(
			module,
			filename,
			compile(
				module,
				filename
			)
		),
		stream
	);
}

require.extensions['.cafe'] = loader;
module.exports = {
	render: function(filename, params, callback) {
		var mod = require(filename);

		var req = {
			params: params
		};

		var res = new StringStream('');
		res.on('error', function(err) {
			callback(err, null);
		});
		res.on('finish', function() {
			callback(null, res.val());
		});

		return mod.middleware(req, res, function(err) {
			callback(err, null);
		});
	}
};
