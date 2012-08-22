/*global module:false*/
module.exports = function (grunt) {
    'use strict';
    // Project configuration.
    grunt.initConfig({
        meta: {
            version: '0.1.0',
            js: ['src/js/first.js', 'src/js/*.js', 'src/js/last.js']
        },
        concat: {
            dist: {
                src: ['<config:meta.js>'],
                dest: 'build/j.js'
            }
        },
        min: {
            dist: {
                src: ['<config:concat.dist.dest>'],
                dest: 'build/m.js'
            }
        },
        watch: {
            files: '<config:meta.js>',
            tasks: 'concat min'
        }
    });

    grunt.loadNpmTasks('tasks');

    // Default task.
    grunt.registerTask('default', 'concat min');

};
