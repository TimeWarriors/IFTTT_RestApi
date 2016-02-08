"use srict";

//../settings/settings.json

var express = require('express');
var app = express();
//var bodyParser = require('body-parser');

//app.use(bodyParser.json());

//var port = process.env.PORT || 8080;


app.get('/', function(req, res){
	res.send("<!doctype html><html><head><meta charset='utf-8' /><title>Blink RESTApi</title></head><body>Hello world</body></html>");
})


app.listen(3000);
//console.log("You're on port " + port)