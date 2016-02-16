var fsp = require("fs-promise");
var http = require('http');
var Promise = require('promise')
var nodeSchedule = require('node-schedule');
var timeEditApi = require('timeeditapi');
var timeEdit = new timeEditApi('https://se.timeedit.net/web/lnu/db1/schema1/', 3);

function scheduleHandler(){
	this.InitiateTimer();	
}

scheduleHandler.prototype.InitiateTimer = function(){
	var rule = new nodeSchedule.RecurrenceRule();
	//rule.hour = 5;
	rule.second = 30;
	
	var that = this;
	
	nodeSchedule.scheduleJob(rule, function(){
		that.InitiateEvents().then((data)=>{
			that.CreateEvents(data);
		});		
	});
	
	
}

scheduleHandler.prototype.getTodaysSchedule = function(){
	timeEdit.getTodaysSchedule('Johan Leitet').then((schedule) =>{
		console.log(JSON.stringify(schedule, null, 2));
		console.log(schedule[0].booking.time.startTime);
	}).catch((err)=>{
		console.log("ERROR: "+ err);
	})
}

//Returns a promise that gives the public data from the usersetting.json file
scheduleHandler.prototype.InitiateEvents = function(){
	return new Promise((resolve, reject) =>{
		var options = {
			host: "localhost",
			path: "/userData",
			method: 'GET',
			port: '3000'
		
		};

		http.get(options, function(res){

			var chunks = [];
			res.on('data', (chunk)=>{			
				chunks.push(chunk);	

			}).on('end', ()=>{			
				return resolve(JSON.parse(Buffer.concat(chunks)));				
			})
		}).on('error',(err) =>{
			reject(err);
		});	
   });
}

scheduleHandler.prototype.CreateEvents = function(users){
	console.log(users);
	
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