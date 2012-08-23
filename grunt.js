/*global module,require */
module.exports = function (grunt) {
    'use strict';
    var zipstream = require('zipstream'),
        cleanCSS = require('clean-css'),
        fs = require('fs');

    // Project configuration.
    grunt.initConfig({
        meta: {
            version: '0.1.0',
            js: ['src/js/*.js'],
            css: ['src/css/*.css']
        },
        concat: {
            js: {
                src: ['<config:meta.js>'],
                dest: 'build/c.js'
            },
            css: {
                src: ['<config:meta.css>'],
                dest: 'build/c.css'
            }
        },
        min: {
            js: {
                src: ['<config:concat.js.dest>'],
                dest: 'build/m.js'
            }
        },
        mincss: {
            src: ['<config:concat.css.dest>'],
            dest: 'build/m.css'
        },
        zip: {
            src: ['<config:min.js.dest>', '<config:mincss.dest>'],
            dest: 'build/js13kgame.zip',
            map: {from: 'build/', to: ''},
            maxsize: 13312
        },
        watch: {
            files: '<config:meta.js>',
            tasks: 'concat min mincss zip'
        }
    });

    grunt.registerTask('mincss', 'Compresses css files', function () {
        this.requiresConfig('mincss.src', 'mincss.dest');
        var css = grunt.file.read(grunt.config('mincss.src'));
        css = cleanCSS.process(css);
        grunt.file.write(grunt.config('mincss.dest'), css);
    });

    grunt.registerTask('zip', 'Zip files.', function () {
        this.requiresConfig('zip.src', 'zip.dest');
        var files = grunt.file.expandFiles(grunt.config('zip.src')),
            out = fs.createWriteStream(grunt.config('zip.dest')),
            zip = zipstream.createZip(),
            done = this.async();
        zip.pipe(out);

        grunt.utils.async.series([
            function (callback) {
                grunt.utils.async.forEachSeries(files, function (item, callback) {
                    var name = item,
                        map = grunt.config('zip.map');
                    if (map) {
                        name = name.replace(map.from, map.to);
                    }
                    grunt.verbose.writeln('Zipping: "' + item + '" as "' + name + '"');
                    zip.addFile(fs.createReadStream(item), { name: name }, callback);
                }, callback);
            },
            function (callback) {
                zip.finalize(function (written) {
                    var size = grunt.config('zip.maxsize'),
                        string = '"',
                        diff = size - written;
                    string += grunt.config('zip.dest');
                    string += '" is ';

                    if (size && size < written) {
                        string += String(written).red;
                    } else {
                        string += String(written).green;
                    }
                    string += ' bytes';
                    if (size) {
                        string += ', you have ';
                        if (diff < 0) {
                            string += String(diff).red;
                        } else {
                            string += String(diff).green;
                        }
                        string += ' bytes left to use.';
                    } else {
                        string += '.';

                    }

                    grunt.log.writeln(string);
                    callback();
                });
            }
        ], done);
    });

    // Default task.
    grunt.registerTask('default', 'concat min mincss zip');

};
