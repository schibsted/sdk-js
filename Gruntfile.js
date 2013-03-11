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
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        smarttabs: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      testfile: { 
        src: 'test/test.js'
      },
      sdk: {
        src: 'src/spid-sdk-<%= pkg.version %>.js'
      }
    },
    concat: {
      options: {
        stripBanners: true,
        banner: '<%= banner %>'
      },
      sdk: {
        src: ['lib/json2.js', '<%= jshint.sdk.src %>'],
        dest: 'dist/spid-sdk-<%= pkg.version %>.js'
      }
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
        tasks: ['jshint:sdk', 'jshint:testfile', 'concat', 'uglify']
      },
      sdk: {
        files: ['<%= jshint.sdk.src %>', 'test/test.js'],
        tasks: ['jshint:sdk', 'jshint:testfile', 'mocha']
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
  grunt.registerTask('default', ['jshint:sdk', 'jshint:testfile', 'concat', 'uglify']);

};
