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
		updateTimer = nodeSchedule.scheduleJob(new Date(date.getFullYear(), date.getMonth(), 
														date.getDate(), date.getHours(), 
														date.getMinutes(), date.getSeconds() + 30), function(){
			updateTimer = undefined;
			UpdatePresence(queue);
		});
	}
});

//updates the precenses of the users in the queue.
var UpdatePresence = function(queue){
	var userQueue = queue;	
	
	fsp.readFile(fileName, {encoding:'utf8'}).then((contents) =>{
		return new Promise((resolve, reject)=>{			
			
			var parsedContent = JSON.parse(contents);	
			var content = [];

			for (var j = 0; j < userQueue.length; j++){

				for (var i = 0; i < parsedContent.length; i++){

					if(parsedContent[i].userId === userQueue[j].id){

						if(userQueue[j].presence === "false"){
							parsedContent[i].public_data.presence = false;
						}
						else if(userQueue[j].presence === "true"){
							parsedContent[i].public_data.presence = true;
						}
						content.push(parsedContent[i].public_data);
					}
				}
			}
			
			return resolve({fileContent : parsedContent, public_content: content});
		})
	}).then((data)=>{
		var content = data.public_content;
		
			
		fsp.writeFile(fileName, JSON.stringify(data.fileContent)).then(() =>{
			io.emit('statusUpdated', content);	
			console.log("status updated ")
			console.log(content);
			
			//after the updates have been made the queue array needs to be emptied, 
			//doing it this way will keep the Array.observe active on the varible.
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

//If the given id parameter is valid the user is added to the queue
app.post('/update/:id/:presence', function(req, res){
	
	//NOTE: since presence is sent as param it is a string and not a booelean.
	var user = {
		id: req.params.id,
		presence: req.params.presence
	};
	
	fsp.readFile(fileName, {encoding:'utf8'}).then((contents) =>{
		var parsedContent = JSON.parse(contents);
		
		for(var i = 0; i < parsedContent.length; i++){
			if(parsedContent[i].userId === user.id){
				//if it's a registerd userId then it will be added to the queue for chaning the presence.
				queue.push(user);
				break;
			}
		}
	});
	
});

//TODO:This needs to be refactored because if 2 calls where to happen 
//at the same time only one would get it's status saved in the json file.
app.post('/busy', function(req, res){
	console.log(req.body);
	var events = req.body;
	fsp.readFile(fileName, {encoding:'utf8'}).then((contents) => {
		var parsedContents = JSON.parse(contents);
		var content = [];
		
		for(var i = 0; i < events.length; i++){
			for (var j = 0; j < parsedContents.length; j++){
				if(events[i].id === parsedContents[j].userId){
					parsedContents[j].public_data.busy = events[i].busyStatus;
					parsedContents[j].public_data.inRoom = events[i].lectureRoom;
					
					content.push(parsedContents[j].public_data)
					break;
				}
			}
		}
		
		fsp.writeFile(fileName, JSON.stringify(parsedContents)).then(() =>{
			console.log(content);
			io.emit('busyStatusUpdated', content);
		});
	})
});


app.listen(3000, function(){
	//test stuff here
	console.log("listening on port 3000");
});