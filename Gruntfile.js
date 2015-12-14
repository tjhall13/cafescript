module.exports = function(grunt) {
	grunt.initConfig({
		jison: {
			development: {
				files: { './lib/cafe.js': 'cafe.jison' }
			}
		},
		jshint: {
			development: {
				src: ['Gruntfile.js', 'index.js', 'bin/cafe', 'lib/*.js', '!lib/cafe.js']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jison');

	grunt.registerTask('default', ['jison', 'jshint']);
};
