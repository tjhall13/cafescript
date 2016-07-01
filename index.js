var Module = require('module');
var path = require('path');
var fs = require('fs');
var vm = require('vm');

var Scanner = require('./lib/scanner.js');
var Require = require('./lib/require.js');
var Printer = require('./lib/printer.js');
var StringStream = require('./lib/stringstream.js');

var parser = require('./lib/cafe.js').parser;
parser.lexer = new Scanner();

function compile(filename) {
	var input = fs.readFileSync(filename, 'utf8');

	parser.yy.text = '';
	parser.yy.symbols = [];
	parser.yy.offset = [];
	parser.parse(input);

	var symbols = parser.yy.symbols;
	var strings = [];
	var	code = '(function() {\nvar print = __Printer__(this), require = __Require__(this), request = __Request__(this);\n';

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
		__Require__: Require(module, loader),
		__Request__: function(ctx) { return ctx.req; }
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

function exports(module, filename, env, ctx) {
	var func;
	if(module.id in cache) {
		func = cache[module.id];
	} else {
		func = env.script.runInNewContext(env.global, env.options);
		cache[module.id] = func;
	}
	var output = func.bind(ctx);
	output.middleware = function(req, res, next) {
		try {
			var ctx = {
				res: res,
				req: req
			};
			func.call(ctx);
			res.end();
		} catch(err) {
			next(err);
		}
	};

	return output;
}

function loader(module, filename) {
	var ctx = module._$cafe || { res: process.stdout, req: undefined };
	module.exports = exports(
		module,
		filename,
		environment(
			module,
			filename,
			compile(filename)
		),
		ctx
	);
}

require.extensions['.cafe'] = loader;
module.exports = {
	rendering: function(module) {
		return function(filename, globals, callback) {
			var mod;
			filename = Module._resolveFilename(filename, module);
			mod = new Module(filename, module);
			mod.paths = Module._nodeModulePaths(path.dirname(filename));
			mod.filename = filename;
			mod.loaded = true;

			var stream = new StringStream('');
			var env = environment(mod, filename, compile(filename));
			var func = env.script.runInNewContext(Object.assign(env.global, globals), env.options);

			stream.on('error', function(err) {
				callback(err, null);
			});
			stream.on('finish', function() {
				callback(null, stream.val());
			});

			func.call({
				res: stream
			});
			stream.end();
		};
	}
};
