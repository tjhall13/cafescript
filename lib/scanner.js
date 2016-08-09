var OPEN_JS = '<$js';
var INLINE_JS = '<$=';
var OPEN = '<$';
var CLOSE = '$>';

function Scanner() {
	var text, index, state;

	function reset(input) {
		text = input;
		index = 0;
		state = 'initial';

		this.yytext = '';
		this.yyloc = {
			first_column: 0,
			first_line: 1,
			last_column: 0,
			last_line: 1
		};
		this.yylloc = this.yyloc;
	}

	this.lex = function() {
		if(index < 0) {
			return '$end';
		}
		this.yytext = '';

		while(index < text.length) {
			switch(state) {
				case 'initial':
					if(text.substr(index, 4) == OPEN_JS) {
						switch(text.charAt(index + 4)) {
							case ' ':
							case '\t':
								this.yyloc.last_line = this.yyloc.first_line;
								this.yyloc.last_column = this.yyloc.first_column + 5;
								index += 5;
								state = 'code';
								return 'LITERAL';
							case '\n':
							case '\r':
								this.yyloc.last_line = this.yyloc.first_line + 1;
								this.yyloc.last_column = 0;
								index += 5;
								state = 'code';
								return 'LITERAL';
						}
					} else if(text.substr(index, 3) == INLINE_JS) {
						switch(text.charAt(index + 3)) {
							case ' ':
							case '\t':
								this.yyloc.last_line = this.yyloc.first_line;
								this.yyloc.last_column = this.yyloc.first_column + 4;
								index += 4;
								state = 'code';
								return 'INLINE';
							case '\n':
							case '\r':
								this.yyloc.last_line = this.yyloc.first_line + 1;
								this.yyloc.last_column = 0;
								index += 4;
								state = 'code';
								return 'INLINE';
						}
					} else if(text.substr(index, 2) == OPEN) {
						switch(text.charAt(index + 2)) {
							case ' ':
							case '\t':
								this.yyloc.last_line = this.yyloc.first_line;
								this.yyloc.last_column = this.yyloc.first_column + 3;
								index += 3;
								state = 'code';
								return 'LITERAL';
							case '\n':
							case '\r':
								this.yyloc.last_line = this.yyloc.first_line + 1;
								this.yyloc.last_column = 0;
								index += 3;
								state = 'code';
								return 'LITERAL';
						}
					}
					break;
				case 'code':
					if(text.substr(index, 2) == CLOSE) {
						this.yyloc.last_line = this.yyloc.first_line;
						this.yyloc.last_column = this.yyloc.first_column + 2;
						index += 2;
						state = 'initial';
						return 'CODE';
					} else if(text.substr(index, 2) == '/*') {
						this.yytext += text.charAt(index);
						index += 1;
						state = 'block';
					} else if(text.substr(index, 2) == '//') {
						this.yytext += text.charAt(index);
						index += 1;
						state = 'line';
					}
					break;
				case 'block':
					if(text.substr(index, 2) == '*/') {
						this.yytext += text.charAt(index);
						index += 1;
						state = 'code';
					}
					break;
				case 'line':
					if(text.charAt(index) == '\n' || text.charAt(index) == '\r') {
						state = 'code';
					}
					break;
			}

			if(text.charAt(index) == '\n' || text.charAt(index) == '\r') {
				this.yyloc.first_line++;
				this.yyloc.first_column = 0;
			} else {
				this.yyloc.first_column++;
			}

			this.yytext += text.charAt(index);
			index++;
		}

		index = -1;
		return 'EOF';
	};

	this.setInput = function(input) {
		reset.call(this, input);
	};

	reset.call(this);
}

module.exports = Scanner;
