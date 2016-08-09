%start cafe

%%

cafe    : input         { yy.symbols = $1; }
        ;

input   : inject input  { $2.unshift($1); $$ = $2; }
        | EOF           { yy.symbols.push({ string: $1 }); $$ = yy.symbols; }
        ;

inject  : literal code  { $$ = { string: $1, code: $2, offset: 0 }; }
        | inline code   { $$ = { string: $1, code: 'print(' + $2 + ');', offset: 6 }; }
        ;

literal : LITERAL       { $$ = $1; yy.offsets.push({ line: yy.lexer.yylloc.last_line, column: yy.lexer.yylloc.last_column }); }
        ;

inline  : INLINE        { $$ = $1; yy.offsets.push({ line: yy.lexer.yylloc.last_line, column: yy.lexer.yylloc.last_column }); }
        ;

code    : CODE          { $$ = $1; }
        ;
