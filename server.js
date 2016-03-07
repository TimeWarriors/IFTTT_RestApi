"use strict";

let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let fsp = require("fs-promise");
let http = require('http').Server(app);
let io = require('socket.io')(http);
let scheduleHandler = require('./scheduleHandler.js');
let queueHandler = require('./queueHandler.js');

let fileName = "usersettings.json";

let sH = new scheduleHandler(fileName, io);
let queue = new queueHandler(fileName, io);

//to remove string dependencies in my test code I have these set as varibles
let updateSuccessMessage = "Presence updated.";
let updateFailMessage = "Presence update failed.";

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
	let data = [];

	fsp.readFile(fileName, {encoding:'utf8'}).then((contents) =>{
		let parsedContent = JSON.parse(contents);

		for(let i = 0; i < parsedContent.length; i++){
			data.push(parsedContent[i].public_data);
		}

		res.send(data);
	});
})

//If the given id parameter is valid the user is added to the queue
//PARAMS:
//				:id - a registerd user id.
//				:city - city of their current location
//				:presence - boolean, should be true if the user enters the area, false if the user leaves the area.
app.post('/update/:id/:city/:presence', function(req, res){

	//NOTE: since presence is sent as param it is a string and not a booelean.
	let user = {
		id: req.params.id,
		presence: req.params.presence,
		location: req.params.city
	};

	fsp.readFile(fileName, {encoding:'utf8'}).then((contents) =>{
		let parsedContent = JSON.parse(contents);

		for(let i = 0; i < parsedContent.length; i++){
			if(parsedContent[i].userId === user.id){
				//if it's a registerd userId then it will be added to the queue for chaning the presence.
				queue.AddToQueue(user);
				res.send(updateSuccessMessage);
				req.end();
			}
		}

		//If the loop never entered the if statement in the loop and ended the request,
		//the update failed since no one was added to the queue.
		res.send(updateFailMessage)
		req.end();
	});
});


//NOTE:
//This is a temporary post that is used to make easier testning on the client
//This is to be deleted before public
//TODO: Remove this method before publish.
app.post('/testRooms', function(req, res){
		fsp.readFile(fileName, {encoding:'utf8'}).then((contents) =>{
				let parsedContent = JSON.parse(contents);
				let data = [];

				for(let i = 0; i < parsedContent.length; i ++){
						if(parsedContent[i].public_data.inRoom === "—" || parsedContent[i].public_data.inRoom === ""){
							parsedContent[i].public_data.inRoom = "Ny106k, Ny107k, Ny108k";
						}
						else {
							parsedContent[i].public_data.inRoom = "—";
						}
						data.push(parsedContent[i].public_data);
				}

				fsp.writeFile(fileName, JSON.stringify(parsedContent)).then(() => {
						io.emit('statusUpdated', data);
				})
		})
})


//Section: MOCHA TEST START
let server;
exports.updateSuccessMessage = updateSuccessMessage;
exports.updateFailMessage = updateFailMessage;

exports.listen = function(port){
	server = app.listen(process.env.PORT || port, process.env.IP);
}

exports.close = function(){
	server.close();
}

//Section: MOCHA TEST END

http.listen(process.env.PORT || 3000, process.env.IP);
