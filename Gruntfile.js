/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; */\n',
    // Task configuration.
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      tests: {
        src: 'test/spec/*.js'
      },
      sdk: {
        src: [
          'src/spid-sdk.js',
          'src/spid-log.js',
          'src/spid-util.js',
          'src/spid-io.js',
          'src/spid-talk.js',
          'src/spid-cookie.js',
          'src/spid-uri.js',
          'src/spid-event.js'
        ]
      },
      tracker: {
        src: 'src/spid-tracker.js'
      },
    },
    concat: {
      options: {
        stripBanners: true,
        banner: '<%= banner %>',
        process: true
      },
      sdk: {
        src: ['<%= jshint.sdk.src %>'],
        dest: 'dist/spid-sdk-<%= pkg.version %>.js'
      },
      sdktracker: {
        src: ['<%= jshint.sdk.src %>', '<%= jshint.tracker.src %>'],
        dest: 'dist/spid-sdk-pulse-<%= pkg.version %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      sdk: {
        src: '<%= concat.sdk.dest %>',
        dest: 'dist/spid-sdk-<%= pkg.version %>.min.js'
      },
      sdktracker: {
        src: '<%= concat.sdktracker.dest %>',
        dest: 'dist/spid-sdk-pulse-<%= pkg.version %>.min.js'
      }
    },
    mocha: {
      all: {
        src: [ 'test/index.html'],
        options: {
          mocha: {
            ignoreLeaks: false
          },
          run: true
        }
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      sdkdev: {
        files: '<%= jshint.sdk.src %>',
        tasks: ['jshint:sdk', 'jshint:tracker', 'jshint:tests', 'mocha', 'concat', 'uglify']
      },
      sdk: {
        files: ['<%= jshint.sdk.src %>', '<%= jshint.tests.src %>'],
        tasks: ['jshint:sdk', 'jshint:tracker', 'jshint:tests', 'mocha']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha');

  // Default task.
  grunt.registerTask('default', ['jshint:sdk', 'jshint:tracker', 'concat', 'uglify']);

};
