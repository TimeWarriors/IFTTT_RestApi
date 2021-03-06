"use strict";

let Promise = require('promise');
let fsp = require('fs-promise');
let nodeSchedule = require('node-schedule');

let queueTime = 30;

/**
 * Constructor for the class, initiates the required values and the Array.observe event
 * @param  {[string]} fileName [fileName for the setttings file.]
 * @param  {[socket.io obj]} io       [socket.io refrence to make socket emits.]
 */
function queueHandler(fileName, io){
  this.queue = [];
  this.io = io;
  this.updateTimer = undefined;
  this.fileName = fileName;

  let self = this;
  //is called everytime an event happens to the array
  Array.observe(this.queue, function(changes){
      self.handelQueue(changes);
  });
}

/**
 * Adds a user to the queue array which will trigger the Array.observe
 * @param  {[type]} user [description]
 * @return {[type]}      [description]
 */
queueHandler.prototype.AddToQueue = function(user){
    this.queue.push(user);
}


//is called by default everytime something happens to the queue array
//PARAM: changes - an array obj contaning data from changes in the queue array
queueHandler.prototype.handelQueue = function(changes){
    //reference required to the queue
    let self = this;

    //private function that writes in the json file
    let UpdatePresence = function(){
        let userQueue = self.queue;

        fsp.readFile(self.fileName, {encoding:'utf8'}).then((contents) => {
          return new Promise((resolve, reject)=>{
            let parsedContent = JSON.parse(contents);

            let content = [];

            for (let j = 0; j < userQueue.length; j++){

              for (let i = 0; i < parsedContent.length; i++){

                if(parsedContent[i].userId === userQueue[j].id){

                  if(userQueue[j].presence === "false"){
                    parsedContent[i].public_data.presence = false;
                    parsedContent[i].inRoom = "";
                  }
                  else if(userQueue[j].presence === "true"){
                    parsedContent[i].public_data.presence = true;
                    parsedContent[i].public_data.city = userQueue[j].location;
                  }
                  content.push(parsedContent[i].public_data);
                }
              }
            }
            return resolve({fileContent : parsedContent, public_content: content});
          })
        }).then((data)=>{
          let content = data.public_content;

          fsp.writeFile(self.fileName, JSON.stringify(data.fileContent)).then(() =>{
            self.io.emit('statusUpdated', content);
            console.log(content);

            //after the updates have been made the queue array needs to be emptied,
            //doing it this way will keep the Array.observe active on the varible.
            self.queue.splice(0, self.queue.length);
          });
        });
    }


    //checks the updates to the queue array and inititaes a timer if someone was just added to the queue and there is no current timer
    if(changes[0].addedCount > 0 && this.updateTimer === undefined){

          let date = new Date();
          self.updateTimer = nodeSchedule.scheduleJob(new Date(date.getFullYear(), date.getMonth(),
                                                          date.getDate(), date.getHours(),
                                                          date.getMinutes(), date.getSeconds() + queueTime), function(){
          self.updateTimer = undefined;
          UpdatePresence();
      });
      return true;
    }
    return false;
}


module.exports = queueHandler;
