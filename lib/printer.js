function Printer(strings) {
	this.print = function(ctx) {
		var writable = ctx.res;
		var print = function(str) {
			print.write('' + str);
		};

		print.__strings__ = function(i) {
			print.write(strings[i]);
		};

		var buffer;

		print.status = function(status) {
			if(writable.status) {
				return writable.status(status);
			} else {
				return false;
			}
		};

		print.header = function(name, value) {
			if(writable.header) {
				return writable.header(name, value);
			} else {
				return false;
			}
		};

		print.write = function(data) {
			if(Buffer.isBuffer(buffer)) {
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
		};

		print.clean = function() {
			buffer = null;
		};

		print.get = function() {
			return buffer;
		};

		return print;
	};
}

module.exports = Printer;
