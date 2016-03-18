"use strict";

let fsp = require("fs-promise");
let http = require('http');
let Promise = require('promise');
let nodeSchedule = require('node-schedule');
let timeEditApi = require('timeeditapi');

let baseURL = "https://se.timeedit.net/web/lnu/db1/schema1/s.html?i=";

/**
 * constructor for this class which initiates base values and call the InitiateTimers method.
 * @param  {[string]} fileName [string value for the usersettings file]
 * @param  {[object]} io       [socket.io object refrence to make socket emits.]
 */
function scheduleHandler(fileName, io){
	this.io = io;
	this.fileName = fileName;
	this.InitiateTimers();
}

/**
 * Creates a timer event that will occur each day at 5 in the morning where the users presence statuses will be reset aswell as the schedules of all
 * registerd users will be read and events will be created for the times they have on their schedules.
 */
scheduleHandler.prototype.InitiateTimers = function(){

	let rule = new nodeSchedule.RecurrenceRule();

	rule.hour = 5;
	//rule.second = 30;

	let that = this;

	//Will run daily at 5 in the morning
	nodeSchedule.scheduleJob(rule, function(){

		fsp.readFile(that.fileName, {encoding:'utf8'}).then((data) =>{
			//Promise returns an array with the data for the users aswell
			//as their booking data.
			return new Promise((resolve, reject) =>{

				let parsedData = JSON.parse(data);

				if(parsedData.length === undefined || 0){
					reject("The settings file is empty");
				}

				let BookedUsers = [];
				let expectedIndex = parsedData.length;
				for(let i = 0; i < parsedData.length; i++){

					//Daily reset for the presence status for all registerd users
					parsedData[i].public_data.presence = false;

					//Gets user schedule
					that.getUserSchedule(parsedData[i]).then((userData)=>{
						//if a user has any booking data they are added to an array for users with bookings.
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


			//Creates 2 arrays,
			//one contaning all of the times for any scheduled events
			//the other one contains the data for those events
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
								lectureRoom: "—"
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



/**
 * returns the given user object with an added value called bookingData that is an
 * array contaning the data for their bookings for the day.
 * @param  {[object]} user [object of a user]
 * @return {[object]}      [object of a user with booking data added]
 */
scheduleHandler.prototype.getUserSchedule = function(user){

	return new Promise((resolve, reject) => {
		let data = [];
		let index = 0;

		timeEditApi.getScheduleByScheduleUrl(baseURL + user.public_data.publicid).then((schedule) =>{

			var date = new Date();

			//if the search dident find anything then
			if(schedule[0].booking === undefined){
				console.log("No more bookings for this person on their schedule. : " + user.public_data.name);
			}
			else {

				console.log(schedule[0].booking.time.startDate);

				//Array that contains [year, month, date] for the first scheduled event
				let startDate = schedule[index].booking.time.startDate.split("-");

				//Date for the first scheduled event
				let scheDate = new Date(startDate[0], startDate[1], startDate[2]);
				console.log(scheDate);


				if(scheDate.getFullYear() === date.getFullYear() && scheDate.getMonth() === date.getMonth() + 1){
						//if the current event is scheduled for today then it's true
						let isToday = (scheDate.getDate() === date.getDate());

						//This will loop while the scheduled events are for today
						while(isToday){
									data.push({
										startTime: schedule[index].booking.time.startTime,
										endTime: schedule[index].booking.time.endTime,
										lectureRoom: schedule[index].booking.columns[2] || "—"
									});
									index += 1;
									startDate = schedule[index].booking.time.startDate.split("-");
									scheDate = new Date(startDate[0], startDate[1], startDate[2]);
									isToday = (scheDate.getDate() === date.getDate());
						}
				}
			}

			user.bookingData = data;

			return resolve(user);

		}).catch(function(e){
			console.log("Error when getting the schedule occured: " + e);
			reject(e);
		});
	});
}


/**
 * schedules events based on the given scheduledEvents array param that has a strict setup.
 * @param  {[array]} scheduledEvents [An array with a strict setup to effectivly create events.]
 * @param  {[string]} fileName        [string name for the settings file.]
 */
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
					io.emit('statusUpdated', content);
				});
			});

		}.bind(null, events))
	}
}

module.exports = scheduleHandler;
