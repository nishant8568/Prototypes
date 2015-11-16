/**
 * Created by Nishant on 9/30/2015.
 */
module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        autoprefixer: {
            build: {
                expand: true,
                src: [ 'app/css/**/*.css' ],
                dest: 'build'
            }
        },
        cssmin: {
            build: {
                files: {
                    'build/application.css': [ 'build/**/*.css' ]
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            js: {
                src: ['vendor/js/**/*.js', 'app/js/**/*.js'],
                dest: 'build/script.js'
            },
            css: {
                src: ['vendor/css/**/*.css', 'app/css/**/*.css'],
                dest: 'build/style.css'
            }
        },
        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            build: {
                src: 'build/script.js',
                dest: 'build/script.min.js'
            }
        },
        watch: {
            stylesheets: {
                files: 'app/css/**/*.css',
                tasks: [ 'stylesheets' ]
            },
            scripts: {
                files: 'app/js/**/*.js',
                tasks: [ 'scripts' ]
            }
        },
        useminPrepare: {
            html: 'index.html'
        }
    });

    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask(
        'stylesheets',
        [ 'autoprefixer', 'cssmin' ]
    );
    grunt.registerTask(
        'scripts',
        [ 'concat', 'uglify' ]
    );
    // Default task(s).
    grunt.registerTask('default', ['stylesheets', 'scripts']);
};