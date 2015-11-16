/**
 * Main application routes
 */

'use strict';
var errors = require('./errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/sample', require('./api/sample'));

  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get();

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile('client/index.html');
    });
};
