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
    };
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
        src: 'src/*.js'
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
    clean: ['dist', 'build'],
    compress: {
      main: {
        options: {
          archive: 'build/spid-sdk-pack.zip'
        },
        files: [{
          cwd: 'dist/',
          src: ['*.js'],
          expand: true
        }
        ]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  // Default task.
  grunt.registerTask('default', ['clean', 'jshint:sdk', 'webpack', 'template', 'uglify', 'compress']);
  grunt.registerTask('test', ['jshint', 'karma:unit']);

};
