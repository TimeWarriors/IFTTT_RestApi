var assert = require('assert');
var http = require('http');

var server = require('./server.js');

describe('server response', function(){
  before(function(){
    server.listen(8000);
  });

  it('should return 200', function(done){
    var options = {
      host: "localhost",
      path: '/',
      method: 'GET',
      port: 8000
    }

    var hej = http.get(options, function(res){
      expect(res.statusCode).to.equal(200);
      console.log("HEj");
    });
    console.log(hej);
    done();
  })

  after(function(){
    server.close();
  })
})
