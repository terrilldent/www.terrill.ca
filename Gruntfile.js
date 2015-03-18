module.exports = function( grunt ){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            build: {
                src: [ 'build' ]
            },
        },

        copy: {
             client: {
                files: [{
                    cwd: 'src/',
                    dest: 'build/',
                    expand: true,
                    src: ['!src/feed.xml', 
                          '**/*.css', 
                          '**/*.ttf', 
                          '**/*.png', 
                          '**/*.ico', 
                          '**/*.jpg', 
                          '**/*.php', 
                          '**/*.gif', 
                          '**/*.ico', 
                          '**/*.js', 
                          '**/*.xml']
                }]
             }
        },
         
        jslint: {
            client: {
                src: ['src/**/*.js','!src/mint/**/*'],
                directives: { 
                    sloppy: true,
                    browser: true,
                    nomen: true,
                    plusplus: true,
                    todo: true,
                    white: true,
                    predef: []
                },
                options: {
                    failOnError: false
                }
            }
        },

        less: {
            client: {
                files: [{
                    cwd: 'src/css/',
                    dest: 'build/css/',
                    expand: true,
                    ext: '.css',
                    src: ['*.less', '!{var,mix}*.less' ]
                }]
            }
        },

        nodemon: {
            dev: {
                script: 'src/server/app.js'
            }
        },

        open: {
            dev: {
                path: 'http://localhost:8800',
                app: 'Google Chrome'
            }
        },

        nodestatic: {
            server: {
                options: {
                    port: 8800,
                    base: 'build/'
                }
            }
        },
        
        shell: {
            jekyllBuild: {
                command: 'cd src && jekyll build && cd ..'
            }
        },

        watch: {
            options: {
                debounceDelay: 250
            },
            clientjs: {
                files: ['src/**/*.js'],
                tasks: ['jslint', 'copy']
            },
            clienthtml: {
                files: ['src/**/*.html'],
                tasks: ['shell:jekyllBuild', 'less']
            },
            clientcss: {
                options: {
                    livereload: 1338,
                    livereloadOnError: true,
                    spawn: false
                },
                files: ['src/css/**/*.less'],
                tasks: ['less']
            },
            client: {
                options: {
                    livereload: 1338,
                    livereloadOnError: true,
                    spawn: false
                },
                files: ['!src/**/*.html', '!src/css/**/*.less', 'src/**/*'],
                tasks: ['copy']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-shell');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-nodestatic');
    grunt.loadNpmTasks('grunt-env');

    grunt.registerTask('build', ['jslint', 'copy', 'shell:jekyllBuild', 'less']);
    grunt.registerTask('default', ['build', 'nodestatic', 'open', 'watch']);
};