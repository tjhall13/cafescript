var path = require('path');
var fs = require('fs');
var vm = require('vm');

var Require = require('./require.js');
var Printer = require('./printer.js');
var Scanner = require('./scanner.js');
var Translator = require('./translator.js');
var ParseError = require('./error.js').ParseError;
var RuntimeError = require('./error.js').RuntimeError;

var jsParser = require('acorn');
var cafeParser = require('./cafe.js').parser;
cafeParser.lexer = new Scanner();

function compile(filename) {
	var input = fs.readFileSync(filename, 'utf8');

	cafeParser.yy.text = '';
	cafeParser.yy.symbols = [];
	cafeParser.yy.offsets = [];
	cafeParser.parse(input);

	var symbols = cafeParser.yy.symbols;
	var offsets = cafeParser.yy.offsets;
	var strings = [];
	var blocks = [];
	var	code = '(function() {\n';

	for(var i = 0; i < symbols.length; i++) {
		if(!symbols[i].string) {
			symbols[i].string = '';
		}
		if(!symbols[i].code) {
			symbols[i].code = '';
		}
		strings.push(symbols[i].string);
		code += '\nprint.__strings__(' + i + ');\n';
		blocks.push(code.split(/[\r\n]/).length);
		code += symbols[i].code;
	}
	code += '});';

	var translator = new Translator(blocks, symbols, offsets);
	var script;
	try {
		script = new vm.Script(code, {
			displayErrors: true,
			filename: filename
		});
	} catch(err) {
		if(err.name == 'SyntaxError') {
			try {
				jsParser.parse(code);
			} catch(e) {
				err = new ParseError(err, e.loc, input, filename, translator);
			}
		}
		throw err;
	}

	return {
		script: script,
		strings: strings,
		translator: translator
	};
}

function Environment(module, filename) {
	var component = compile(filename);

	this.global = {
		console: console,
		__dirname: path.dirname(filename),
		__filename: path.basename(filename)
	};

	this.options = {
		filename: filename
	};

	this.printer = new Printer(component.strings);
	this.manager = new Require(module);

	this.translator = component.translator;
	this.script = component.script;
}

Environment.prototype.run = function(ctx, args) {
	if(!args) {
		args = [];
	}

	var func = this.script.runInNewContext(
		Object.assign(
			{ require: this.manager.require(ctx), print: this.printer.print(ctx) },
			this.global,
			ctx.global || { }
		),
		this.options
	);

	try {
		func.apply(null, args);
	} catch(e) {
		throw new RuntimeError(e, this.options.filename, this.translator);
	}
};

Environment._cache = { };

module.exports = Environment;
