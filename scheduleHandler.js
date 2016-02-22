var fsp = require("fs-promise");
var http = require('http');
var Promise = require('promise');
var nodeSchedule = require('node-schedule');
var timeEditApi = require('timeeditapi');

var timeEdit = new timeEditApi('https://se.timeedit.net/web/lnu/db1/schema1/', 3);


function scheduleHandler(fileName){
	this.fileName = fileName;
	this.InitiateTimers();	
}

//TODO: create one event per time where a user's busy status changes.
scheduleHandler.prototype.InitiateTimers = function(){
	var rule = new nodeSchedule.RecurrenceRule();
	//rule.hour = 5;
	rule.second = 30;
	
	var that = this;
	console.log("Job is about to be scheduled")
	nodeSchedule.scheduleJob(rule, function(){
		fsp.readFile(that.fileName, {encoding:'utf8'}).then((data) =>{
			var parsedData = JSON.parse(data);
			//console.log(parsedData[userIndex])
			
			for(var userIndex in parsedData){
				that.getUserSchedule(parsedData[userIndex]).then((userData)=>{
					//console.log(userData);
					for(var bookingIndex in userData.bookingData){
						
					}
				});
			}
		});
		
	});
		/*console.log("Job is beign scheduled" + that.fileName);
		fsp.readFile(that.fileName, {encoding:'utf8'}).then((data) =>{
			var parsedData = JSON.parse(data);
			
			for(var i = 0; i < parsedData.length; i++){
				
				that.getUserSchedule(parsedData[i]).then((userData)=>{
					
					//date obj used to get the year, month and day for the events that are going to be created.
					var date = new Date();
					
					console.log(userData.bookingData);
					console.log(userData.bookingData.length);
					for(var j = 0; j < userData.bookingData.length; j++){

						var timeString = userData.bookingData[j].startTime;
						var stringIndex = timeString.indexOf(":");
						var hour = timeString.substr(0, stringIndex);
						var minute = timeString.substr(stringIndex+1);
						//console.log(hour +"sh");
						//console.log(minute +"sm");
						//initaites an event to set user status to busy.
						//console.log(userData);
						that.InitaiteBusyModeEvent(userData, new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 53, 00), true).then(() => {
							
						});
						
						timeString = userData.bookingData[j].endTime;
						stringIndex = timeString.indexOf(":");
						hour = timeString.substr(0, stringIndex);
						minute = timeString.substr(stringIndex+1);
						
						//console.log(hour+"eh");
						//console.log(minute+"em");
						//initates an event to revert the busy status
						that.InitaiteBusyModeEvent(userData, new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 00), false).then(() => {
							
						});
						
						
						console.log(bookings[index]);
					}
				});
			}
			
			
		});		
	});*/
	
	
}

scheduleHandler.prototype.getUserSchedule = function(user){
	
	return new Promise((resolve, reject)=> {
		var data = [];
		
		console.log(user.public_data.name.split("_").join(" "));//console.log(user.public_data.name.split("_").join(" "));
		
		timeEdit.getTodaysSchedule(user.public_data.name.split("_").join(" ")).then((schedule) =>{
			//console.log(JSON.stringify(schedule, null, 2));
			console.log(schedule);
			//when there is no scheduel for the day it returns [ { id: 'Johan Leitet'} ] / [ { id: 'John Häggerud'} ]
			for(var j = 0; j < schedule.length; j++){
				/*data.push({startTime: schedule[j].booking.time.startTime,
						  endTime: schedule[j].booking.time.endTime})*/
			}
			
			user.bookingData = data;
			
			return resolve(user);
			
		}).catch((err)=>{
			console.log("Error occured during the process of getting the schedule.");
			console.log(err);
		})
		//return resolve(userName);
	});
}

scheduleHandler.prototype.InitaiteBusyModeEvent = function(user, date, busyStatus){
	//console.log(user.userId);
	var userData = user;
	var dateTime = date;
	var busyStatusData = busyStatus;
	
	return new Promise((resolve, reject) => {
		
		console.log(userData.userId);
		
		nodeSchedule.scheduleJob(dateTime, function(){
		var options = {
			host: "localhost",
			path: "/busy/"+userData.userId+"/"+busyStatusData,
			method: 'POST',
			port: '3000'
		};
		

		var req = http.request(options, function(res){
			//req sent
			return resolve();
		}).on('error', (err) =>{
			reject(err);
		})

		req.end();
		})
	});
	
}

scheduleHandler.prototype.StartEvent = function(data){
	/*timeEdit.search('John_Häggerud')
    .then((result) => {
        console.log(JSON.stringify(result, null ,2));
    }).catch((er) => {
        console.log(er);
    });*/
}

module.exports = scheduleHandler;