"use strict";

let http = require('http');
let fsp = require('fs-promise');

let testID = "1234";
let testValue;


//test script for the app.post
let testRun = function(){

	fsp.readFile("usersettings.json", {encoding:'utf8'}).then((contents) =>{
		let parsedContent = JSON.parse(contents);
		let data = null;

		for(let i = 0; i < parsedContent.length; i++){
			if(parsedContent[i].userId === testID){
				data = parsedContent[i];
				break;
			}

		}

		//set the test value to the opposite so it will allways change the value
		if(data.public_data.presence){
			testValue = false;
		}
		else {
			testValue = true;
		}

		console.log("options initated.");

		let options = {
			host: "localhost",
			path: "/update/"+testID+"/Kalmar/"+testValue,
			method: 'POST',
			port: '3000'
		};

		let req = http.request(options, function(res){
			console.log("Status code for test call = " + res.statusCode);
		})

		req.end();


	});
}



let testBody = function(){

	let postData = JSON.stringify({
		msg: 'Hello worldu.'
	})
	let options = {
			host: "localhost",
			path: "/test",
			method: 'POST',
			port: '3000',
			headers: {
				'Content-Type': 'application/json'
			}
		};

		let req = http.request(options);

		req.write(postData)
	   	req.end();

		//console.log("After end.")
}


let testGotInLecture = function(io){


	fsp.readFile("usersettings.json", {encoding:'utf8'}).then((contents) =>{
			let content = [];
			let parsedContent = JSON.parse(contents);

			for (let i = 0; i < parsedContent.length; i++){
				if(parsedContent[i].public_data.inRoom === ""){
					parsedContent[i].public_data.inRoom = "Ny106k, Ny107k, Ny108k";
				}
				else {
					parsedContent[i].public_data.inRoom = "";
				}
				content.push(parsedContent[i].public_data);
			}

			io.emit('statusUpdated', content);
	});


}


module.exports.testGotInLecture = testGotInLecture;
