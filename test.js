"use strict";

let assert = require('assert');
let http = require('http');
let server = require('./server.js');
let queueHandler = require('./queueHandler.js');
let scheduleHandler = require('./scheduleHandler.js');
let nodeSchedule = require('node-schedule');

////////////////
//Server tests//
////////////////
describe('Server Tests:', function(){
  before(function(){
    server.listen(8000);
  });

  //Test 1
  it('GET should return statuscode 200', function(done){

      let options = {
        host: "localhost",
        path: '/',
        method: 'GET',
        port: 8000
      }

      http.get(options, function(res){
        assert.equal(200, res.statusCode, "Error with status code.");
        //console.log("HEj");
        done();
      });
    });

    //Test 2
    it('GET should successfully return an array contaning users', function(done){
      let options = {
        host: "localhost",
        path: '/userData',
        method: 'GET',
        port: 8000
      }

      let chunks = [];

      http.get(options, function(res){
        res.on('data', function(chunk){
          chunks.push(chunk);
        }).on('end', function(){


          let body = JSON.parse(Buffer.concat(chunks));

          assert(Array.isArray(body) === true, "Get user data did not return as an array.")
          done();
        })
      })
    });


    //Test 3
    it('POST should successfully add a user to the queue', function(done){
        let options = {
          host: "localhost",
          path: '/update/1234/Kalmar/true',
          method: 'POST',
          port: 8000
        }

        let chunks = [];

        let req = http.request(options, function(res){
          res.on('data', function(chunk){
            chunks.push(chunk);
          }).on('end', function(){

            let body = Buffer.concat(chunks);
            assert.equal(server.updateSuccessMessage, body, "User was not added to the queue array.");
            done();
          })
        })
        req.end();
    });

    //Test 4
    it('POST should not add a user to the queue array', function(done){
      let options = {
        host: "localhost",
        path: '/update/NOT_A_VALID_ID/Kalmar/true',
        method: 'POST',
        port: 8000
      }

      let chunks = [];

      let req = http.request(options, function(res){
        res.on('data', function(chunk){
          chunks.push(chunk);
        }).on('end', function(){

          let body = Buffer.concat(chunks);
          assert.equal(server.updateFailMessage, body, "User was added to the queue even tho he/she shouldent.");
          done();
        })
      })
      req.end();
    });

  after(function(){
    server.close();
  })
});

//////////////////////
//queueHandler tests//
//////////////////////
describe('Queue tests:', function(){
  //longest test can take up to 5000 ms
  this.timeout(5000);

  let qh;
  let testChanges;

  before(function(){
    qh = new queueHandler();
  });

  beforeEach(function(){
    testChanges = [{addedCount: 0}];
    qh.updateTimer = undefined;
    qh.queue = [];
  })

  //Test 5
  it('Should initiate a timer when addedCount is bigger than 1 and updateTimer is undefined.', function(done){
    testChanges[0].addedCount = 1;
    //updateTimer is undefined by default
    assert(qh.handelQueue(testChanges) === true, 'Timer was not initiated when addedCount is bigger than 0.');
    done();
  });

  //Test 6
  it('Should not initate a timer when addedCount is bigger or equal to 1 and updateTimer is defined', function(done){
    testChanges[0].addedCount = 1;
    qh.updateTimer = 'A defiend value';

    assert(qh.handelQueue(testChanges) === false, 'A Timer was initated when addedCount is bigger or equal to 1 and updateTimer is defined.');
    done();
  })

  //Test 7
  it('Should not initate a timer when addedCount is lower or equal to 0 and updateTimer is undefined.', function(done){
    testChanges[0].addedCount = 0;
    assert(qh.handelQueue(testChanges) === false, 'Timer was initiated when addedCount is lower or equal to 0 and updateTimer is undefined.');
    done();
  });

  //Test 8
  it('Should not initate a timer when addedCount is lower or equal to 0 and updateTimer is defined', function(done){
    testChanges[0].addedCount = 0;
    qh.updateTimer = 'A defined value';
    assert(qh.handelQueue(testChanges) === false, 'Timer was initiated when addedCount is lower or equal to 0 and updateTimer is defined.');
    done();
  })

  //Test 9
  it('Should add 2 users to the queue when they are both added at the EXACT same time.', function(done){
    let date = new Date();

    let timeDate = new Date(date.getFullYear(), date.getMonth(),
                        date.getDate(), date.getHours(),
                        date.getMinutes(), date.getSeconds() + 3);

    nodeSchedule.scheduleJob(timeDate, function(){
                    qh.AddToQueue({user: 'this is a user'});
    });
    nodeSchedule.scheduleJob(timeDate, function(){
                    qh.AddToQueue({user: 'this is a user'});
    });

    console.log("");
    console.log("           4 second timeout.");
    console.log("");

    setTimeout(function(){
      assert(qh.queue.length === 2, 'Both users were not added to the array.');
      done();
    }, 4000)
  });
});
