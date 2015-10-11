%lex

%x code
%x comment
%x line

%%
"<$"[\s\n]          %{  this.begin('code');
                        yytext = yy.text; yy.text = '';
                        return 'LITERAL'; %}
<code>"$>"          %{  this.popState();
                        yytext = yy.text; yy.text = '';
                        return 'CODE'; %}

<code>"/*"          yy.text += yytext; this.begin('comment');
<comment>"*/"       yy.text += yytext; this.popState();
<comment>[^\n]+     yy.text += yytext;
<comment>[\n]       yy.text += yytext;

<code>"//"          yy.text += yytext; this.begin('line');
<line>[^\n]+        yy.text += yytext;
<line>[\n]          yy.text += yytext; this.popState();

<code>[^\n][ ]"$>"  %{  yytext = yy.text +
                            yytext.substr(0, yytext.length - 3);
                        yy.text = '';
                        this.popState(); return 'CODE'; %}
<code>[^\n]         yy.text += yytext;
<code>[\n]          yy.text += yytext;

"<$"[\s\n]          %{  yytext = yy.text +
                            yytext.substr(0, yytext.length - 3);
                        yy.text = '';
                        this.begin('code'); return 'LITERAL'; %}
[^\n]               yy.text += yytext;
[\n]                yy.text += yytext;

<<EOF>>             yytext = yy.text; return 'EOF';

/lex

%start cafe

%%

cafe    : input         { yy.symbols = $1; }
        ;

input   : code input    { $2.unshift($1); $$ = $2; }
        | EOF           { yy.symbols.push({ string: $1 }); $$ = yy.symbols; }
        ;

code    : LITERAL CODE  { $$ = { string: $1, code: $2 }; }
        ;
