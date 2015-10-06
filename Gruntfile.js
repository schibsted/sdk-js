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
          'src/spid-talk.js',
          'src/spid-cookie.js',
          'src/spid-cache.js',
          'src/spid-localstorage.js',
          'src/spid-persist.js',
          'src/spid-uri.js',
          'src/spid-event.js',
          'src/spid-event-trigger.js'
        ]
      }
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
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      sdk: {
        src: '<%= concat.sdk.dest %>',
        dest: 'dist/spid-sdk-<%= pkg.version %>.min.js'
      }
    },
    blanket_mocha: {
      all: [ 'test/index.html' ],
      options: {
        threshold: 70
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      sdk: {
        files: ['<%= jshint.sdk.src %>', '<%= jshint.tests.src %>'],
        tasks: ['jshint:sdk', 'jshint:tests', 'blanket_mocha']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-blanket-mocha');

  // Default task.
  grunt.registerTask('default', ['jshint:sdk', 'concat', 'uglify']);

  grunt.registerTask('test', ['blanket_mocha']);
};
