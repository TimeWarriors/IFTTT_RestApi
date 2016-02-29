var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fsp = require("fs-promise");
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fileName = "usersettings.json";

var scheduleHandler = require('./scheduleHandler.js');
var queueHandler = require('./queueHandler.js');

var queue = [];
var updateTimer = undefined;

var sH = new scheduleHandler(fileName, io);
var queue = new queueHandler(fileName, io);

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
				queue.AddToQueue(user);
				break;
			}
		}
	});
	res.send("Presence Updated");

});

//Section: MOCHA TEST
exports.listen = function(port){
	app.listen(process.env.PORT || port, process.env.IP);
}

exports.close = function(){
 	//Section: server.close();
}
//MOCHA TEST END

app.listen(process.env.PORT || 3000, process.env.IP);
