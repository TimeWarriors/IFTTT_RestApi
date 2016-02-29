var Promise = require('promise');
var fsp = require('fs-promise');
var nodeSchedule = require('node-schedule');


function queueHandler(fileName, io){
  this.queue = [];
  this.io = io;
  this.updateTimer = undefined;
  this.fileName = fileName;
  
  var self = this;
  //is called everytime an event happens to the array
  Array.observe(this.queue, function(changes){
      self.handelQueue(changes);
  });
}

//Adds a user in the queue array and in turn triggers the observe.
queueHandler.prototype.AddToQueue = function(user){
    this.queue.push(user);
}


//is called by default everytime something happens to the queue array
//PARAM: changes - an array obj contaning data from changes in the queue array
queueHandler.prototype.handelQueue = function(changes){
    //reference required to the queue
    var self = this;

    //private function
    var UpdatePresence = function(){
        var userQueue = self.queue;

        fsp.readFile(self.fileName, {encoding:'utf8'}).then((contents) => {
          return new Promise((resolve, reject)=>{
            var parsedContent = JSON.parse(contents);

            var content = [];

            for (var j = 0; j < userQueue.length; j++){

              for (var i = 0; i < parsedContent.length; i++){

                if(parsedContent[i].userId === userQueue[j].id){

                  if(userQueue[j].presence === "false"){
                    parsedContent[i].public_data.presence = false;
                  }
                  else if(userQueue[j].presence === "true"){
                    parsedContent[i].public_data.presence = true;
                  }
                  content.push(parsedContent[i].public_data);
                }
              }
            }
            return resolve({fileContent : parsedContent, public_content: content});
          })
        }).then((data)=>{
          var content = data.public_content;

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
    if(changes[0].removed.length <= 0 && this.updateTimer === undefined){
      var date = new Date();
      updateTimer = nodeSchedule.scheduleJob(new Date(date.getFullYear(), date.getMonth(),
                                                      date.getDate(), date.getHours(),
                                                      date.getMinutes(), date.getSeconds() + 30), function(){
        updateTimer = undefined;
        UpdatePresence();
      });
    }
}

module.exports = queueHandler;
