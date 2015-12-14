function printer(writable) {
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

module.exports = printer;
