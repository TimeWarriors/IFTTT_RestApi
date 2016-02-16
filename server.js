var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fsp = require("fs-promise");
var lightHandler = require('../lightHandler/lightHandler'); 
var lh = new lightHandler();
var path = '../settings/settings.json';



var http = require('http').Server(app);
var test = require('http');
var io = require('socket.io')(http);

var scheduleHandler = require('./scheduleHandler.js');
var sH = new scheduleHandler();

var path = "";
var fileName = "usersettings.json";

app.use(bodyParser.json());
app.use(express.static(__dirname + "/client_prototype"))

//returns the index page for the client
app.get('/', function(req, res){	
	fsp.readFile(__dirname + "client_prototype/index.html", {encoding:'utf8'}).then((contents) =>{
		res.send(contents.toString());
	});
});

<<<<<<< HEAD
//returns public data from all registerd user in usersettings.json
app.get("/userData", function(req, res){
	var data = [];
	
	fsp.readFile(path + fileName, {encoding:'utf8'}).then((contents) =>{
		var parsedContent = JSON.parse(contents);

		for(var i = 0; i < parsedContent.length; i++){
			data.push(parsedContent[i].public_data);
		}
		
		res.send(data);		
	});	
})

=======
>>>>>>> e3e9479289ab4e3b2f6f44f660e6f9a3fd0faafe

//Sets the presence in the settings JSON file to the users current presence.
app.post('/update/:id/:presence', function(req, res){
	
	//NOTE: since presence is sent as param it is a string and not a booelean.
	var data = {
		id: req.params.id,
		presence: req.params.presence
	};
	
<<<<<<< HEAD
	
	fsp.readFile(path+fileName, {encoding:'utf8'}).then((contents) =>{
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
						
				fsp.writeFile(path + fileName, JSON.stringify(parsedContent)).then(() =>{
					//and the public data is emitted so the status can be updated in real time.
					io.emit('statusUpdated', content);
					console.log("Status updated.");
				});
=======
	fsp.readFile(path, {encoding:'utf8'}).then((contents) =>{
		var parsedContent = JSON.parse(contents);		
		
		for (var i = 0; i < parsedContent.length; i++){
			
			if(parsedContent[i].type === "blink" && parsedContent[i].userID === data.id){
				if(data.presence){
					lh.changeColor(parsedContent[i].lampId, 0, 255, 0, 0);
				}
				else {
					lh.changeColor(parsedContent[i].lampId, 255, 0, 0, 0);
				}
				return;
>>>>>>> e3e9479289ab4e3b2f6f44f660e6f9a3fd0faafe
			}
		}
	});
});



http.listen(3000, function(){
	console.log("listening on port 3000");
});