'use strict';

var express = require('express');
var controller = require('./sample.controller');

var router = express.Router();

router.get('/', controller.index);
//router.get('/test/:test', controller.indexYear);
//router.post('/', controller.create );
//router.delete('/:id',auth.hasRole('admin'), controller.destroy);

module.exports = router;
