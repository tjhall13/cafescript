var stream = require('stream');
var util = require('util');

function Directed() {
	stream.Writable.call(this);

	var _stream = null;

	this._write = function(chunk, encoding, callback) {
		_stream.write(chunk, encoding, callback);
	};

	this.direct = function(stream) {
		_stream = stream;
	};

	this.release = function() {
		_stream = null;
	};
}
util.inherits(Directed, stream.Writable);

module.exports = Directed;
