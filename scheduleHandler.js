"use strict";

let fsp = require("fs-promise");
let http = require('http');
let Promise = require('promise');
let nodeSchedule = require('node-schedule');
let timeEditApi = require('timeeditapi');

let timeEdit = new timeEditApi('https://se.timeedit.net/web/lnu/db1/schema1/', 3);


function scheduleHandler(fileName, io){
	this.io = io;
	this.fileName = fileName;
	this.InitiateTimers();
}

//TODO: Reset all users presence status at a certain time
//creates a daily event that will inturn create events whenever a registerd user is busy on their timeedit schedule
scheduleHandler.prototype.InitiateTimers = function(){
	let rule = new nodeSchedule.RecurrenceRule();

	rule.hour = 5;
	//rule.second = 30;

	let that = this;

	nodeSchedule.scheduleJob(rule, function(){
		fsp.readFile(that.fileName, {encoding:'utf8'}).then((data) =>{

			return new Promise((resolve, reject) =>{

				let parsedData = JSON.parse(data);

				if(parsedData.length === undefined || 0){
					reject("The settings file is empty");
				}

				let BookedUsers = [];
				let expectedIndex = parsedData.length;
				for(let i = 0; i < parsedData.length; i++){
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

			let EventTimes = [];
			let Events = [];

			for(let i = 0; i < bookedUsers.length; i ++){

				for(let j = 0; j < bookedUsers[i].bookingData.length; j++){

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
								lectureRoom: bookedUsers[i].bookingData[j].lectureRoom
							});

					Events.push({
								time: bookedUsers[i].bookingData[j].endTime,
								id: bookedUsers[i].userId,
								lectureRoom: ""
							});
				}
			}

			//Example of how scheduledEvents will look like:
			//[ { time: 12:00, userEvents: [{id: bookedUsers[x].userId, room: bookedUsers[x].bookingData.lectureRoom}, ... ] }, ...]
			let scheduledEvents = [];

			for (let i = 0; i < EventTimes.length; i++){
				scheduledEvents.push({time : EventTimes[i], events: []})
				for (let j = 0; j < Events.length; j++){

					if(Events[j].time === EventTimes[i]){
						scheduledEvents[i].events.push(Events[j]);
						//remove the obj to shorten furhter loops.
						Events.splice(j, 1);
					}
				}
			}

			that.scheduleEvents(scheduledEvents, that.fileName);
		});

	});
}

//returns a Promise that will give the schedule of a user, If the user is not found it will log an error
scheduleHandler.prototype.getUserSchedule = function(user){

	return new Promise((resolve, reject) => {
		let data = [];

		timeEdit.getTodaysSchedule(user.public_data.name.split("_").join(" ")).then((schedule) =>{

			if(schedule[0].booking === undefined){
				console.log("No more bookings for this person this day.")
			}
			else {
				for(let j = 0; j < schedule.length; j++){
				data.push({startTime: schedule[j].booking.time.startTime,
						  endTime: schedule[j].booking.time.endTime,
						 	lectureRoom: schedule[j].booking.columns[2] || "Not specified."
					 	})
				}
			}

			user.bookingData = data;

			return resolve(user);

		}).catch(function(e){
			console.log("Error :" + e);
			reject(e);
		});
	});
}


//Creates events based on the data given in the array
//PARAMS:
//				scheduledEvents = array contaning data for scheduled events.
//				fileName = path to settings file where the data gets changed.
scheduleHandler.prototype.scheduleEvents = function(scheduledEvents, fileName){
	let date = new Date();
	let hour;
	let minute;
	let stringIndex;

	for (let i = 0; i < scheduledEvents.length; i++){

		stringIndex = scheduledEvents[i].time.indexOf(":");
		hour = scheduledEvents[i].time.substr(0, stringIndex);
		minute = scheduledEvents[i].time.substr(stringIndex + 1);

		//Saves the data for this scheduled event to later bind it to the scheduledJob
		let events = scheduledEvents[i].events;



		//initates a scheduled job and sends all the data scheduled for that time.
		nodeSchedule.scheduleJob(new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0), function(self, scheduledEvents){

			fsp.readFile(fileName, {encoding:'utf8'}).then((contents) => {
				let parsedContents = JSON.parse(contents);
				let content = [];

				for(let i = 0; i < events.length; i++){
					for (let j = 0; j < parsedContents.length; j++){
						if(events[i].id === parsedContents[j].userId){

							parsedContents[j].public_data.inRoom = events[i].lectureRoom;

							content.push(parsedContents[j].public_data)
							break;
						}
					}
				}

				fsp.writeFile(fileName, JSON.stringify(parsedContents)).then(() => {
					io.emit('busyStatusUpdated', content);
				});
			});

		}.bind(null, events))
	}
}

module.exports = scheduleHandler;
