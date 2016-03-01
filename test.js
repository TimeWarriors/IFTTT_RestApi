"use strict";

let assert = require('assert');
let http = require('http');
let server = require('./server.js');

describe('server response', function(){
  before(function(){
    server.listen(8000);
  });

  it('should return 200', function(done){

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
    })

    it('Should successfully return an array contaning objects', function(done){
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

          //TODO: Check the return value to be an array
        })
      })
    })


    it('Should successfully add a user to the queue', function(done){
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
    })

    it('Should not add a user to the queue array', function(done){
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
    })







  after(function(){
    server.close();
  })
})
