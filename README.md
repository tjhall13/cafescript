# CafeScript
CafeScript is a node component driven preprocessor.

## Usage
CafeScript can be imported as a library that will run .cafe scripts and output them to a `WriteStream` that you supply or it can be installed globally and run as `$ cafe myfile.cafe`.

### Syntax
CafeScript .cafe files are simillar to .php files.  CafeScript will preprocess the file running the JavaScript code between the `<$ $>` tags.  The JavaScript has access to NodeJS globals as well as the cafe function itself.  The cafe function takes a file path relative to the calling script and an optional `WriteStream` which defaults to stdout.

### Example
```
// main.js
var cafe = require('cafescript');

var script = cafe('./myscript.cafe', process.stdout);
script.print();
```

```
<!-- myscript.cafe -->
<$
var hello = 'hello';
$>
<html>
  <head>
    <title><$ print(hello); $></title>
  </head>
  <body>
<$

// Include other scripts like this:
// var script = cafe('./other.cafe');
// script.print();

print('CafeScript');

$>
  </body>
</html>
```

## Author
Trevor Hall

## License
MIT
