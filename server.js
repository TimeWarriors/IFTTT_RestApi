var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fsp = require("fs-promise");
var Promise = require('promise');
var nodeSchedule = require('node-schedule');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fileName = "usersettings.json";

var scheduleHandler = require('./scheduleHandler.js');
var sH = new scheduleHandler(fileName);

var queue = [];
var updateTimer = undefined;

//observes the array that gets data pushed whenever a successful post is made.
Array.observe(queue, function(changes){
	
	//if the changes doesent include remoal of the array an if the timer is undefinder a time is initatied.
	if(changes[0].removed.length <= 0 && updateTimer === undefined){
		var date = new Date();
		updateTimer = nodeSchedule.scheduleJob(new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() + 30), function(){
			updateTimer = undefined;
			UpdatePresence(queue);
		});
	}
});

//updates the precenses of the users in the queue.
var UpdatePresence = function(queue){
	var cont = queue;	
	console.log(cont);
	
	
	fsp.readFile(fileName, {encoding:'utf8'}).then((contents) =>{
		return new Promise((resolve, reject)=>{			
			
			var parsedContent = JSON.parse(contents);	

			for (var j = 0; j < cont.length; j++){

				for (var i = 0; i < parsedContent.length; i++){

					if(parsedContent[i].userId === cont[j].id){

						if(cont[j].presence === "false"){
							parsedContent[i].public_data.presence = false;
						}
						else if(cont[j].presence === "true"){
							parsedContent[i].public_data.presence = true;
						}
					}
				}
			}
			
			return resolve(parsedContent);
		})
	}).then((parsedContent)=>{
		var content = parsedContent;
			
		fsp.writeFile(fileName, JSON.stringify(content)).then(() =>{
			io.emit('statusUpdated');	
			//after the updates have been made the array needs to be emptied, doing it this way will keep the Array.observe active on the varible.
			queue.splice(0, queue.length);
		})		
	});	
}


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
//TODO: create a que for the API calls, if 2 are sent at the exact same time there will be no overwrite of their status.
app.post('/update/:id/:presence', function(req, res){
	
	//NOTE: since presence is sent as param it is a string and not a booelean.
	var data = {
		id: req.params.id,
		presence: req.params.presence
	};
	
	fsp.readFile(fileName, {encoding:'utf8'}).then((contents) =>{
		var parsedContent = JSON.parse(contents);
		
		for(var i = 0; i < parsedContent.length; i++){
			if(parsedContent[i].userId === data.id){
				//if it's a registerd userId then it will be added to the queue for chaning the presence.
				queue.push(data);
				break;
			}
			console.log("loop")
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



app.post('/test', function(req, res){
	console.log("in server");
	
	console.log(req.body)
})



app.listen(3000, function(){
	console.log("listening on port 3000");
});