"use strict";
/**
 * This script was merley used for testing purposes.
 * It simulates a call to the server that would then add a user in the queue.
 *
 * The testID needs to be the same as of the user you want to test it on.
 */


let http = require('http');
let fsp = require('fs-promise');

let testID = "1234";
let testValue;


/**
 * Tests adding a user in the queue by sending simulation data to the server.
 */
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

testRun();
