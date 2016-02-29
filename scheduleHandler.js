var fsp = require("fs-promise");
var http = require('http');
var Promise = require('promise');
var nodeSchedule = require('node-schedule');
var timeEditApi = require('timeeditapi');

var timeEdit = new timeEditApi('https://se.timeedit.net/web/lnu/db1/schema1/', 3);


function scheduleHandler(fileName, io){
	this.io = io;
	this.fileName = fileName;
	this.InitiateTimers();
}

//TODO: Reset all users presence status at a certain time
//creates a daily event that will inturn create events whenever a registerd user is busy on their timeedit schedule
scheduleHandler.prototype.InitiateTimers = function(){
	var rule = new nodeSchedule.RecurrenceRule();

	rule.hour = 5;
	rule.second = 30;

	var that = this;

	nodeSchedule.scheduleJob(rule, function(){

		fsp.readFile(that.fileName, {encoding:'utf8'}).then((data) =>{

			return new Promise((resolve, reject) =>{

				var parsedData = JSON.parse(data);

				if(parsedData.length === undefined || 0){
					reject("The settings file is empty");
				}

				var BookedUsers = [];
				var expectedIndex = parsedData.length;
				for(var i = 0; i < parsedData.length; i++){
					//console.log(i);
					that.getUserSchedule(parsedData[i]).then((userData)=>{
						//if a user has bookings then they are added to the array
						if(userData.bookingData.length > 0){
							BookedUsers.push(userData);
						}
						//else if a user doesnt have a booking for the day the expected index is lowerd.
						else {
							expectedIndex -= 1;
						}

						//Bookedusers length and expected length are equal then the loop is finished
						if(BookedUsers.length === expectedIndex){
							return resolve(BookedUsers);
						}
					});
				}

			});
		}).then((bookedUsers) =>{
			//console.log(bookedUsers)
			//console.log(bookedUsers[0].bookingData)
			var EventTimes = [];
			var Events = [];

			for(var i = 0; i < bookedUsers.length; i ++){

				for(var j = 0; j < bookedUsers[i].bookingData.length; j++){

					//if an event time is not in the event times array it's added
					if(EventTimes.indexOf(bookedUsers[i].bookingData[j].startTime) === -1){

						EventTimes.push(bookedUsers[i].bookingData[j].startTime)
					}
					if(EventTimes.indexOf(bookedUsers[i].bookingData[j].endTime) === -1){

						EventTimes.push(bookedUsers[i].bookingData[j].endTime)
					}

					//All events are added to the Events array
					Events.push({
								time: bookedUsers[i].bookingData[j].startTime,
								id: bookedUsers[i].userId,
								busyStatus: true,
								lectureRoom: bookedUsers[i].bookingData[j].lectureRoom
							});

					Events.push({
								time: bookedUsers[i].bookingData[j].endTime,
								id: bookedUsers[i].userId,
								busyStatus: false,
								lectureRoom: ""
							});
				}
			}

			//Example of how scheduledEvents will look like: [ { time: 12:00, userEvents: [{id: bookedUsers[x].userId, busy: true/false, room: bookedUsers[x].bookingData.lectureRoom}, ... ] }, ...]
			var scheduledEvents = [];

			for (var i = 0; i < EventTimes.length; i++){
				scheduledEvents.push({time : EventTimes[i], events: []})
				for (var j = 0; j < Events.length; j++){

					if(Events[j].time === EventTimes[i]){
						scheduledEvents[i].events.push(Events[j]);
						//remove the obj to shorten furhter loops.
						Events.splice(j, 1);
					}
				}
			}

			that.scheduleEvents(scheduledEvents);
		});

	});
}

scheduleHandler.prototype.getUserSchedule = function(user){

	return new Promise((resolve, reject) => {
		var data = [];

		//console.log(user.public_data.name.split("_").join(" "));//console.log(user.public_data.name.split("_").join(" "));

		timeEdit.getTodaysSchedule(user.public_data.name.split("_").join(" ")).then((schedule) =>{

			if(schedule[0].booking === undefined){
				console.log("No more bookings for this person this day.")
			}
			else {
				for(var j = 0; j < schedule.length; j++){
				data.push({startTime: schedule[j].booking.time.startTime,
						  endTime: schedule[j].booking.time.endTime,
						 lectureRoom: schedule[j].booking.columns[2] || "Not specified."})
				}
			}

			user.bookingData = data;

			return resolve(user);

		}).catch((err)=>{
			console.log("Error occured during the process of getting the schedule.");
			console.log(err);
		})
	});
}


//Creates events based on the data given in the array
scheduleHandler.prototype.scheduleEvents = function(scheduledEvents){
	var date = new Date();
	var hour;
	var minute;
	var stringIndex;

	for (var i = 0; i < scheduledEvents.length; i++){

		stringIndex = scheduledEvents[i].time.indexOf(":");
		hour = scheduledEvents[i].time.substr(0, stringIndex);
		minute = scheduledEvents[i].time.substr(stringIndex + 1);

		//Saves the data for this scheduled event to later bind it to the scheduledJob
		var events = scheduledEvents[i].events;

		//initates a scheduled job and sends all the data scheduled for that time.
		nodeSchedule.scheduleJob(new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 01, 00), function(self, events){

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

				fsp.writeFile(self.fileName, JSON.stringify(parsedContents)).then(() =>{
					console.log(content);
					io.emit('busyStatusUpdated', content);
				});
			});

		}.bind(this, events))
	}
}

module.exports = scheduleHandler;
