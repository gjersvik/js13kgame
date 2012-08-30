/*global module,require */
module.exports = function (grunt) {
    'use strict';
    var zipstream = require('zipstream'),
        cleanCSS = require('clean-css'),
        fs = require('fs'),
        path = require('path');

    grunt.loadNpmTasks('grunt-closure-compiler');

    // Project configuration.
    grunt.initConfig({
        meta: {
            version: '0.1.0',
            js: ['src/js/namespace.js', 'src/js/*.js'],
            css: ['src/css/*.css'],
            index: 'src/index.html'
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
        'closure-compiler': {
            js: {
                closurePath: '../tools',
                js: ['<config:concat.js.dest>'],
                jsOutputFile: 'build/m.js',
                options: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5_STRICT',
                    use_types_for_optimization: '',
                    third_party: ''
                }
            }
        },
        mincss: {
            src: ['<config:concat.css.dest>'],
            dest: 'build/m.css'
        },
        buildHtml: {
            html: '<config:meta.index>',
            css: '<config:mincss.dest>',
            js: '<config:closure-compiler.js.jsOutputFile>',
            dest: 'build/index.html'
        },
        zip: {
            src: ['<config:buildHtml.dest>'],
            dest: 'build/js13kgame.zip',
            map: {from: 'build/', to: ''},
            maxsize: 13312
        },
        debugHtml: {
            html: '<config:meta.index>',
            css: '<config:meta.css>',
            js: '<config:meta.js>',
            dest: 'src/debug.html'
        },
        watch: {
            files: ['<config:meta.index>', '<config:meta.css>', '<config:meta.js>'],
            tasks: 'debugHtml concat min mincss buildHtml zip'
        }
    });

    grunt.registerTask('buildHtml', 'Build html file', function () {
        this.requiresConfig('buildHtml.html', 'buildHtml.css', 'buildHtml.js', 'buildHtml.dest');
        var data = {},
            html = grunt.file.read(grunt.config('buildHtml.html'));
        data.css = '<style>' + grunt.file.read(grunt.config('buildHtml.css')) + '</style>';
        data.js = '<script>' + grunt.file.read(grunt.config('buildHtml.js')) + '</script>';

        html = html.replace(/>\s+</g, '><');
        html = grunt.template.process(html, data);
        grunt.file.write(grunt.config('buildHtml.dest'), html);
    });

    grunt.registerTask('debugHtml', 'Build debug version of html file', function () {
        this.requiresConfig('debugHtml.html', 'debugHtml.css', 'debugHtml.js', 'debugHtml.dest');
        var data = {css: '', js: ''},
            htmldir = path.dirname(grunt.config('debugHtml.html')),
            html = grunt.file.read(grunt.config('debugHtml.html'));
        grunt.file.expandFiles(grunt.config('debugHtml.css')).forEach(function (file) {
            data.css += '<link rel="stylesheet" href="' + path.relative(htmldir, file) + '" />\r\n';
        });

        grunt.file.expandFiles(grunt.config('debugHtml.js')).forEach(function (file) {
            data.js += '<script src="' + path.relative(htmldir, file) + '"></script>\r\n';
        });


        html = grunt.template.process(html, data);
        grunt.file.write(grunt.config('debugHtml.dest'), html);
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
    grunt.registerTask('default', 'debugHtml concat closure-compiler mincss buildHtml zip');

};
