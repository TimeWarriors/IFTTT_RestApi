var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fsp = require("fs-promise");
var http = require('http').Server(app);
var test = require('http');
var io = require('socket.io')(http);

var fileName = "usersettings.json";

var scheduleHandler = require('./scheduleHandler.js');
var sH = new scheduleHandler(fileName);




app.use(bodyParser.json());
app.use(express.static(__dirname + "/client"))

//returns the index page for the client
app.get('/', function(req, res){	
	fsp.readFile(__dirname + "client/index.html", {encoding:'utf8'}).then((contents) =>{
		res.send(contents.toString());
	});
});


//returns public data from all registerd user in usersettings.json
app.get("/userData", function(req, res){
	var data = [];
	
	fsp.readFile(fileName, {encoding:'utf8'}).then((contents) =>{
		var parsedContent = JSON.parse(contents);

		for(var i = 0; i < parsedContent.length; i++){
			data.push(parsedContent[i].public_data);
		}
		
		res.send(data);		
	});	
})

//Sets the presence in the settings JSON file to the users current presence.
app.post('/update/:id/:presence', function(req, res){
	
	//NOTE: since presence is sent as param it is a string and not a booelean.
	var data = {
		id: req.params.id,
		presence: req.params.presence
	};
	
	
	fsp.readFile(fileName, {encoding:'utf8'}).then((contents) =>{
		var parsedContent = JSON.parse(contents);	

		for (var i = 0; i < parsedContent.length; i++){

			if(parsedContent[i].userId === data.id){
				
				if(data.presence === "false"){
					parsedContent[i].public_data.presence = false;
				}
				else if(data.presence === "true"){
					parsedContent[i].public_data.presence = true;
				}
				
				//public data for a user that had his/ her status just updated.
				var content = parsedContent[i].public_data; //Jävla javascript ibland.
						
				fsp.writeFile(fileName, JSON.stringify(parsedContent)).then(() =>{
					//and the public data is emitted so the status can be updated in real time.
					io.emit('statusUpdated', content);
					console.log("Status updated.");
					
				});
			}
		}
	});
});

app.post('/busy/:id/:status', function(req, res){
	//NOTE: since presence is sent as param it is a string and not a booelean.
	var data = {
		id: req.params.id,
		status: req.params.status
	};
	
	//console.log(data);
	
	if(data.id === "1234"){
		console.log("Johans ska sättas nu")
	}
	
		
	
	fsp.readFile(fileName, {encoding:'utf8'}).then((contents) =>{
		
		var parsedContent = JSON.parse(contents);	
		//console.log(parsedContent)
		
		for (var i = 0; i < parsedContent.length; i++){
			if(parsedContent[i].userId === data.id){
				
				
				if(data.status === "false"){
					parsedContent[i].public_data.busy = false;
				}
				else if(data.status === "true"){
					parsedContent[i].public_data.busy = true;
				}
				
				var content = parsedContent[i].public_data; //Jävla javascript ibland.
				console.log("FINAL SHOWDOWN:" + content.busy + " on user: " + content.name);
						
				fsp.writeFile(fileName, JSON.stringify(parsedContent)).then(() =>{
					//and the public data is emitted so the status can be updated in real time.
					io.emit('busyUpdated', content);
					console.log("busy status updated.");
					
				});
			}
	}});
	
	
})



http.listen(3000, function(){
	console.log("listening on port 3000");
});