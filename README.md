# CafeScript
CafeScript is a node component driven preprocessor.

## Usage
CafeScript can be imported as a library that will run .cafe scripts and output them to `process.stdout` or installed globally and run as `$ cafe myfile.cafe`.

### Syntax
CafeScript .cafe files are simillar to .php files.  CafeScript will preprocess the file running the JavaScript code between the `<$ $>` tags.  The JavaScript has access to NodeJS globals as well as a print function.  The print function prints to the output stream which defaults to stdout.

### Standard Out
```
// main.js
require('cafescript');

var script = require('./myscript.cafe');
script();
```

```
<!-- myscript.cafe -->
<$
var hello = 'Hello, World';
$>
<html>
  <head>
    <title><$ print(hello); $></title>
  </head>
  <body>
<$

// Include other scripts like this:
// var script = require('./other.cafe');
// script();

print('CafeScript');

$>
  </body>
</html>
```

### Middleware
CafeScript also exports a middleware function with the signature `function(req, res)` where `res` is an output stream the file will use as an output and `req` is an accesable global `request` in the script.

## Author
Trevor Hall

## License
MIT
