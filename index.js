var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');

var mqtt = require('mqtt'), url = require('url');

var mqttoptions = {
    host: "m10.cloudmqtt.com",
    port: 12556,
    username: "soaring",
    password: "password"
};

// Create a client connection
var client = mqtt.connect(mqttoptions);

client.on('connect', function() { // When connected

  // subscribe to a topic
  client.subscribe('domoticz/out', function() {
    // when a message arrives, do something with it
    client.on('message', function(topic, message, packet) {
      console.log("Received '" + message + "' on '" + topic + "'");
      var jsonobj = JSON.parse(message);
      var idx = jsonobj.idx;
      var idxname = jsonobj.name;
      if (jsonobj.dtype === "Light/Switch") {
           var abcdef = "";
           var abcdef = '{"lights":{"' + idx + '":{"Status":"On","Level":100,"Type":"Light\/Switch","Name":"' + idxname + '"}}}';
           var jsonABC = JSON.parse(abcdef);
           io.emit('update',jsonABC);
      }
    });
  });

  // publish a message to a topic
  //client.publish('domoticz/out', 'my message', function() {
    //console.log("Message is published");
    //client.end(); // Close the connection when published
  //});
});

app.use(express.static('static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  
  var url = 'https://davidnoren.com/soaring/ajax/ajax.php?action=getAllStatus';
  initialAPI = request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var APIResponse = JSON.parse(body);
        console.log("Got a response: ", APIResponse);
        socket.emit('initial', APIResponse);
      } else {
        console.log("Got an error: ", error, ", status code: ", response.statusCode);
      }
  });
  
});

http.listen(80, function(){
  console.log('listening on *:80');
});
