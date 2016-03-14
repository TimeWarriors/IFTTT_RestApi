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

/**
 * returns the index.html
 */
app.get('/', function(req, res){
	fsp.readFile(__dirname + "client/index.html", {encoding:'utf8'}).then((contents) =>{
		res.send(contents.toString());
	});
});


/**
 * Returns the public data for the users
 */
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

/**
 * Adds a user to the queue if given valid parameters
 * @param  '/update
 * /:id [id for a user, this is key for getting into the queue]
 * /:city [the city the user is currently in.]
 * /:presence' [boolean, true if they enter the school area, false if the leave it.]
 */
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
