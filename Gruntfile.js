module.exports = function(grunt) {
	grunt.initConfig({
		jison: {
			development: {
				files: { './lib/cafe.js': 'cafe.jison' }
			}
		},
		jshint: {
			development: {
				src: ['Gruntfile.js', 'index.js', 'bin/cafe', 'lib/*.js', '!lib/cafe.js', 'test/**.js']
			}
		},
		nodeunit: {
			options: {
				reporter: 'default'
			},
			development: {
				src: ['test/*.js', 'test/**/*.js']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jison');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	grunt.registerTask('default', ['jison', 'jshint', 'nodeunit']);
};
