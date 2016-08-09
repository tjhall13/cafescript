function Translator(blocks, symbols, offsets) {
	this.blocks = blocks;
	this.symbols = symbols;
	this.offsets = offsets;
}

Translator.prototype.translate = function(location) {
	var index = this.blocks.reduce(function(current, offset, index) {
		if(location.line < offset) {
			return current;
		} else {
			return index;
		}
	}, 0);

	return {
		line: this.offsets[index].line + location.line - this.blocks[index],
		column: this.offsets[index].column + location.column - this.symbols[index].offset
	};
};

module.exports = Translator;
