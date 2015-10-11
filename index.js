var path = require('path');
var fs = require('fs');
var vm = require('vm');
var Buffer = require('buffer').Buffer;

var parser = require('./cafe.js').parser;

function Printer(writable) {
    var print = function(str) {
        print.write('' + str);
    };
    
    var buffer;
    
    print.write = function(data) {
        if(buffer && Buffer.isBuffer(buffer)) {
            buffer = Buffer.concat([buffer, new Buffer(data)]);
        } else {
            writable.write(data);
        }
    };
    
    print.start = function() {
        buffer = new Buffer(0);
    };
    
    print.flush = function() {
        if(buffer && Buffer.isBuffer(buffer)) {
            writable.write(buffer);
        }
        buffer = null;
        writable.flush();
    };
    
    print.clean = function() {
        buffer = null;
    };
    
    print.get = function() {
        return buffer;
    };
    
    return print;
}

module.exports = function cafe(file, writable) {
    file = path.resolve(__dirname, file);
    var input = fs.readFileSync(file, 'utf8');
    
    if(writable) {
        cafe.writable = writable;
    } else {
        writable = cafe.writable;
    }
    
    parser.yy.text = '';
    parser.yy.symbols = [];
    parser.parse(input);
    
    var symbols = parser.yy.symbols;
    var strings = [];
    var code = '';
    
    for(var i = 0; i < symbols.length; i++) {
        if(!symbols[i].string) {
            symbols[i].string = '';
        }
        if(!symbols[i].code) {
            symbols[i].code = '';
        }
        strings.push(symbols[i].string);
        code += 'print(__strings__[' + i + ']);\n' + symbols[i].code;
    }
    
    var script = new vm.Script(code);
    var self = cafe;
    
    return {
        print: function() {
            var context = vm.createContext({
                print: Printer(writable),
                cafe: self,
                require: require,
                arguments: arguments,
                
                __strings__: strings
            });
            
            script.runInContext(context, { });
        }
    };
};
