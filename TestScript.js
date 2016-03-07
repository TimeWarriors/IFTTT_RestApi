"use strict";

let http = require('http');
let fsp = require('fs-promise');

let testID = "1234";
let testValue;


//test script for the app.post
//It simulates a call that would be made from IFTTT
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

testRun();
