var util = require('util');

function ParseError(err, loc, src, filename, translator) {
	var location = translator.translate(loc);
	var reference = filename + ':' + location.line + ':' + location.column;
	var line = src.split(/[\r\n]/)[location.line - 1];
	var pointer = Array.prototype.reduce.call(line, function(str, char, index) {
		if(index < location.column) {
			if(char == '\t') {
				str += '\t';
			} else {
				str += ' ';
			}
		}
		return str;
	}, '') + '^';
	var description = reference + '\n' + line + '\n' + pointer + '\n';

	this.stack = description + err.stack;
	this.name = this.constructor.name;
	this.message = description + err.message;
	this.location = location;
}
util.inherits(ParseError, SyntaxError);

function RuntimeError(err, filename, translator) {
	var regex = new RegExp('    at ' + filename + ':([0-9]+):([0-9]+)');
	var stack = err.stack.split('\n');
	var index = stack.findIndex(function(line) {
		return line.match(regex) !== null;
	});
	var error = stack[index].match(regex);
	var location = translator.translate({ line: +error[1], column: +error[2] });
	stack[index] = '    at ' + filename + ':' + location.line + ':' + location.column;

	this.stack = stack.join('\n');
	this.name = this.constructor.name;
	this.message = err.message;
}
util.inherits(RuntimeError, Error);

module.exports = {
	ParseError: ParseError,
	RuntimeError: RuntimeError
};
