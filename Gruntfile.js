/*global module:false*/
module.exports = function(grunt) {

  function webpackCfg(target, fileName, entryName) {
    var entry = {};
    entry[entryName] = './src/' + fileName +'.js';
    return {
      entry: entry,
      output: {
        library: '[name]',
        libraryTarget: target,
        path: './dist/',
        filename: fileName + '-<%= pkg.version %>-' + target + '.js'
      }
    }
  }

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
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      sdkVar: {
        src: 'dist/spid-sdk-<%= pkg.version %>-var.js',
        dest: 'dist/spid-sdk-<%= pkg.version %>-var.min.js'
      },
      sdkAmd: {
        src: 'dist/spid-sdk-<%= pkg.version %>-amd.js',
        dest: 'dist/spid-sdk-<%= pkg.version %>-amd.min.js'
      },
      sdkCommonJs: {
        src: 'dist/spid-sdk-<%= pkg.version %>-commonjs2.js',
        dest: 'dist/spid-sdk-<%= pkg.version %>-commonjs2.min.js'
      }
    },
    template: {
      options: {
        data: {
          pkg : grunt.file.readJSON('package.json')
        }
      },
      all: {
        files: {
          'dist/spid-sdk-<%= pkg.version %>-amd.js': ['dist/spid-sdk-<%= pkg.version %>-amd.js'],
          'dist/spid-sdk-<%= pkg.version %>-commonjs2.js': ['dist/spid-sdk-<%= pkg.version %>-commonjs2.js'],
          'dist/spid-sdk-<%= pkg.version %>-var.js': ['dist/spid-sdk-<%= pkg.version %>-var.js']
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    webpack : {
      varSdk: webpackCfg('var', 'spid-sdk', 'SPiD'),
      varUri: webpackCfg('var', 'spid-uri', 'SPiD_Uri'),
      amdSdk: webpackCfg('amd', 'spid-sdk', 'SPiD'),
      amdUri: webpackCfg('amd', 'spid-uri', 'SPiD_Uri'),
      commonJsSdk: webpackCfg('commonjs2', 'spid-sdk', 'SPiD'),
      commonJsUri: webpackCfg('commonjs2', 'spid-uri', 'SPiD_Uri')
    },
    compress: {
      main: {
        options: {
          archive: 'dist/spid-sdk-<%= pkg.version %>.zip'
        },
        files: [{
          cwd: 'dist/',
          src: ['*.js'],
          expand: true
        }
        ]
      }
    },
    "release-it": {
      options: {
        pkgFiles: ['package.json', 'bower.json'],
        increment: '<%= pkg.version %>'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-webpack");
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-release-it');
  grunt.loadNpmTasks('grunt-contrib-compress');
  // Default task.
  grunt.registerTask('default', ['jshint:sdk', 'webpack', 'template', 'uglify']);
  grunt.registerTask('test', ['karma:unit']);
  // Release related
  grunt.registerTask('post-release', function() {
    grunt.log.subhead("Release created");
    grunt.log.ok("NOTE: You'll have to upload the archive zip to the GitHub release yourself!");
  });
  grunt.registerTask('release', ['uglify','compress','release-it', 'post-release']);

};
