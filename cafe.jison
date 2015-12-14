%lex

%x code
%x start
%x comment
%x line

%%
"<$js"[\s\n]        %{  this.begin('start');
                        this.begin('code');
                        yytext = yy.text;
                        yy.text = '';
                        return 'LITERAL'; %}
<start>"<$js"[\s\n] %{  this.begin('code');
                        yytext = yy.text;
                        yy.text = '';
                        return 'LITERAL'; %}
<start>"<$"[\s\n]   %{  this.begin('code');
                        yytext = yy.text;
                        yy.text = '';
                        return 'LITERAL'; %}
<code>"$>"          %{  this.popState();
                        yytext = yy.text;
                        yy.text = '';
                        return 'CODE'; %}

<code>"/*"          yy.text += yytext; this.begin('comment');
<comment>"*/"       yy.text += yytext; this.popState();
<comment>[^\n]+     yy.text += yytext;
<comment>[\n]       yy.text += yytext;

<code>"//"          yy.text += yytext; this.begin('line');
<line>[^\n]+        yy.text += yytext;
<line>[\n]          yy.text += yytext; this.popState();

<code>[\s\n]"$>"    %{  yytext = yy.text;
                        yy.text = '';
                        this.popState(); return 'CODE'; %}
<code>[^\n]         yy.text += yytext;
<code>[\n]          yy.text += yytext;

[^\n]               yy.text += yytext;
[\n]                yy.text += yytext;
<start>[^\n]        yy.text += yytext;
<start>[\n]         yy.text += yytext;

<<EOF>>             yytext = yy.text; return 'EOF';
<start><<EOF>>             yytext = yy.text; return 'EOF';

/lex

%start cafe

%%

cafe    : input         { yy.symbols = $1; }
        ;

input   : inject input  { $2.unshift($1); $$ = $2; }
        | EOF           { yy.symbols.push({ string: $1 }); $$ = yy.symbols; }
        ;

inject  : literal code  { $$ = { string: $1, code: $2 }; }
        ;

literal : LITERAL       { $$ = $1; yy.offset.push({ line: yy.lexer.yylloc.last_line, column: yy.lexer.yylloc.last_column }); }
        ;

code    : CODE          { $$ = $1; }
        ;
