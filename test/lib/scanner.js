var Scanner = require('../../lib/scanner.js');

var path = require('path');
var fs = require('fs');

module.exports = {
	scanner: function(test) {
		var script = fs.readFileSync(path.resolve(__dirname, '../fixtures/test1.cafe'), 'utf8');
		var scanner = new Scanner();
		var token;

		scanner.setInput(script);

		token = scanner.lex();
		test.equal(token, 'LITERAL');
		test.equal(scanner.yytext, '');

		token = scanner.lex();
		test.equal(token, 'CODE');
		test.equal(scanner.yytext, 'var other = require(\'./test2.cafe\');\nvar cache = require(\'./dir/test3.cafe\');\n');

		token = scanner.lex();
		test.equal(token, 'LITERAL');
		test.equal(scanner.yytext, '\n<html>\n\t<head>\n\t\t<title>');

		token = scanner.lex();
		test.equal(token, 'CODE');
		test.equal(scanner.yytext, 'print(\'hello\'); ');

		token = scanner.lex();
		test.equal(token, 'LITERAL');
		test.equal(scanner.yytext, '</title>\n\t</head>\n\t<body>\n\t\t<ul> ');

		token = scanner.lex();
		test.equal(token, 'CODE');
		test.equal(scanner.yytext, '\t\tfor(var i = 0; i < 10; i++) { ');

		token = scanner.lex();
		test.equal(token, 'LITERAL');
		test.equal(scanner.yytext, '\n\t\t\t<li> ');

		token = scanner.lex();
		test.equal(token, 'CODE');
		test.equal(scanner.yytext, '\t\t\t\tother(i); ');

		token = scanner.lex();
		test.equal(token, 'LITERAL');
		test.equal(scanner.yytext, '\n\t\t\t</li> ');

		token = scanner.lex();
		test.equal(token, 'CODE');
		test.equal(scanner.yytext, '\t\t} ');

		token = scanner.lex();
		test.equal(token, 'LITERAL');
		test.equal(scanner.yytext, '\n\t\t</ul> ');

		token = scanner.lex();
		test.equal(token, 'CODE');
		test.equal(scanner.yytext, '\t\tcache(); ');

		token = scanner.lex();
		test.equal(token, 'EOF');
		test.equal(scanner.yytext, '\n\t</body>\n</html>\n');

		test.done();
	}
};
