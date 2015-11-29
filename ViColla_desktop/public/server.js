/**
 * Created by Nishant on 11/29/2015.
 */
var express = require('express');
var app = express();

app.use(express.static(__dirname + "/client"));

app.listen(9000);
console.log('Server running on port 9000');