var stream = require('stream');
var util = require('util');

function Directed() {
	stream.Writable.call(this);

	var _stream = null;

	this._write = function(chunk, encoding, callback) {
		_stream.write(chunk, encoding);
		callback(null);
	};

	this.status = function(value) {
		if(_stream.headersSent) {
			return false;
		} else {
			_stream.status(value);
			return true;
		}
	};

	this.header = function(name, value) {
		if(_stream.headersSent) {
			return false;
		} else {
			var current = _stream.getHeader(name);
			if(current) {
				if(Array.isArray(current)) {
					_stream.setHeader(name, current.concat(value));
				} else {
					_stream.setHeader(name, [current].concat(value));
				}
			} else {
				_stream.setHeader(name, value);
			}
			return true;
		}
	};

	this.direct = function(stream) {
		_stream = stream;
	};

	this.release = function() {
		_stream.end();
		_stream = null;
	};
}
util.inherits(Directed, stream.Writable);

module.exports = Directed;
