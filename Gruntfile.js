module.exports = function(grunt) {
    grunt.initConfig({
        jison: {
            cafe: {
                files: { 'cafe.js': 'cafe.jison' }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'index.js', 'bin/cafe'],
            options: { }
        },
        nodeunit: {
            
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-jison');
    
    grunt.registerTask('default', ['jison', 'jshint']);
};
