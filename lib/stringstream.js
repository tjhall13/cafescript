var util = require('util');
var stream = require('stream');
var Buffer = require('buffer').Buffer;

function StringStream(initial) {
	stream.Writable.call(this);
	var val = new Buffer(initial, 'utf8');

	this._write = function(chunk, encoding, callback) {
		if(encoding != 'buffer') {
			chunk = new Buffer(chunk, encoding);
		}
		val = Buffer.concat([val, chunk]);
		callback(null);
	};

	this.val = function(encoding) {
		if(!encoding) {
			encoding = 'utf8';
		}
		return val.toString(encoding);
	};
}

util.inherits(StringStream, stream.Writable);

module.exports = StringStream;
