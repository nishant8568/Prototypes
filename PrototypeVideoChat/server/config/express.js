/**
 * Express configuration
 */

'use strict';

var express = require('express');
var morgan = require('morgan');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var path = require('path');
var config = {};
config.root =path.normalize(__dirname + '/../..');

module.exports = function(app) {
  app.set('views', config.root + '/server/views');
  app.set('view engine', 'html');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json({limit: '50mb'}));
  //app.use(require('connect-livereload')());
  app.use(methodOverride());
  console.log(path.join(config.root, 'client'));
  app.use(express.static(path.join(config.root, 'client')));
  app.use(morgan('dev'));
  app.use(errorHandler()); // Error handler - has to be last

};
