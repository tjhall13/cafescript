var path = require('path');
var fs = require('fs');
var vm = require('vm');

var Require = require('./require.js');
var Printer = require('./printer.js');
var Scanner = require('./scanner.js');

var parser = require('./cafe.js').parser;
parser.lexer = new Scanner();

function compile(filename) {
	var input = fs.readFileSync(filename, 'utf8');

	parser.yy.text = '';
	parser.yy.symbols = [];
	parser.yy.offset = [];
	parser.parse(input);

	var symbols = parser.yy.symbols;
	var strings = [];
	var	code = '(function() {\n';

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

	func.apply(null, args);
};

Environment._cache = { };

module.exports = Environment;
