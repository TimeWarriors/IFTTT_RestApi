var express = require('express');
var app = express();
var fsp = require("fs-promise");

//Filler page
app.get('/', function(req, res){
	res.send("<!doctype html><html><head><meta charset='utf-8' /><title>Blink RESTApi</title></head><body>Lorem Ipsum</body></html>");
});

//Sets the presence in the settings JSON file to the users current presence.
app.post('/', function(req, res){
	
	var data = JSON.parse(req.body);
	
	fsp.readFile('../settings/settings.json', {encoding:'utf8'}).then((contents) =>{
		var parsedContent = JSON.parse(contents);		
		
		for (var i = 0; i < parsedContent.length; i++){
			
			if(parsedContent[i].type === "blink" && parsedContent[i].userID === data.id){
				//TODO: send a call to lightHandler to change the blink lamp depending on data.presence
			}
		}
	});
});


app.listen(3000);