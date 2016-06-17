var config = require('./config.js');
var idxMap = require('./idxMap.js');

var express = require('express');
var app = express();

if(process.env.DOMOTICZ_PORT) {
    var runPort = process.env.DOMOTICZ_PORT;
}
else {
    var runPort = 3000;
}

var http = require('http').Server(app);
var io = require('socket.io')(http);
var mqtt = require('mqtt'), url = require('url');

var idxHistory = {};

function epoch(){
var lastSet = new Date().valueOf();
lastSet = lastSet/1000;
lastSet = Math.floor(lastSet);
return lastSet;
};

lastSet = epoch();

idxHistory[15] = {
    "level" : 1,
    "status" : "undefined",
    "name" : "name",
    "type" : "Temp",
    "lastSet" : lastSet,
    "humanSet" : false
};

lastSet = epoch();

idxHistory[43] = {
    "level" : 1,
    "status" : "undefined",
    "name" : "name",
    "type" : "Temp",
    "lastSet" : lastSet,
    "humanSet" : false
};

var router = express.Router();

app.use('/api', router);

router.get('/', function(req, res) {
    res.json({ message: 'domiticz-node api' });
});

router.get('/all/off', function(req, res) {
    res.json({ message: '200 OK' });
    myCommand = '{"command": "switchscene", "idx": 2, "switchcmd": "On" }';
    mqttClient.publish('domoticz/in', myCommand);
});

app.use(express.static('static'));

app.get('/', function(req, res){
  password = req.param('p', 'password');
  if(password !== config.security.password){
    return res.sendStatus(401);
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});

var mqttOptions = {
    host: config.mqtt.host,
    port: config.mqtt.port,
    username: config.mqtt.username,
    password: config.mqtt.password
};




// LIGHT FUNCTIONS //

function dimLights(msg){

  //console.log('message: ' + msg);
  mqttClient.publish('domoticz/in', msg);

  setTimeout(function(str1) {
    mqttClient.publish('domoticz/in', str1);
  }, 2000, msg);

  setTimeout(function(str1) {
    mqttClient.publish('domoticz/in', str1);
  }, 3000, msg);

  setTimeout(function(str1) {
    mqttClient.publish('domoticz/in', str1);
  }, 3500, msg);

}

function pollLights(msg){

  //console.log('message: ' + msg);
  mqttClient.publish('domoticz/in', msg);

  setTimeout(function(str1) {
    mqttClient.publish('domoticz/in', str1);
  }, 500, msg);

  setTimeout(function(str1) {
    mqttClient.publish('domoticz/in', str1);
  }, 1000, msg);

  setTimeout(function(str1) {
    mqttClient.publish('domoticz/in', str1);
  }, 1500, msg);

  setTimeout(function(str1) {
    mqttClient.publish('domoticz/in', str1);
  }, 2500, msg);

  setTimeout(function(str1) {
    mqttClient.publish('domoticz/in', str1);
  }, 4000, msg);

}

function switchLights(msg){

  //console.log('message: ' + msg);
  mqttClient.publish('domoticz/in', msg);

}

function autoAction(msg){

  //console.log('message: ' + msg);
  mqttClient.publish('domoticz/autoAction', msg);

}


// Create a client connection
var mqttClient = mqtt.connect(mqttOptions);

mqttClient.on('connect', function() {
    // subscribe to a topic
    mqttClient.subscribe('domoticz/out', function() {
        // when a message arrives, do something with it
        mqttClient.on('message', function(topic, message, packet) {
            //console.log("Received '" + message + "' on '" + topic + "'");
            var jsonobj = JSON.parse(message);
            var idx = jsonobj.idx;
            var idxname = jsonobj.name;
            var status = jsonobj.nvalue;
            var level = jsonobj.svalue1;

            //processEvent(jsonobj);

            if (jsonobj.switchType === "Dimmer") {

                var cstatus = "";

                if (status === 0){
                    cstatus = "Off";
                }

                if (status === 1){
                    cstatus = "On";
                }

                if (status === 2 && level != 100){
                    cstatus = "Transition";
                }

                if (status === 2 && level === 100){
                    cstatus = "On";
                }


                var abcdef = "";

                lastSet = epoch();

                idxHistory[idx] = {
                    "level" : level,
                    "status" : cstatus,
                    "name" : idxname,
                    "type" : "Dimmer",
                    "lastSet" : lastSet
                };

                var abcdef = '{"lights":{"' + idx + '":{"Status":"' + cstatus + '","Level":' + level + ',"Type":"Light\/Switch","Name":"' + idxname + '"}}}';
                var jsonABC = JSON.parse(abcdef);
                io.emit('update',jsonABC);
            }


			if (jsonobj.dtype === "Light/Switch" && jsonobj.switchType === "On/Off") {

                var cstatus = "";

                if (status === 0){
                    cstatus = "Off";
                }

                if (status === 1){
                    cstatus = "On";
                }

                var abcdef = "";

                lastSet = epoch();

                idxHistory[idx] = {
                    "level" : "undefined",
                    "status" : cstatus,
                    "name" : idxname,
                    "type" : "On/Off",
                    "lastSet" : lastSet
                };

                var abcdef = '{"fans":{"' + idx + '":{"Status":"' + cstatus + '","Name":"' + idxname + '"}}}';
                var jsonABC = JSON.parse(abcdef);
                io.emit('update',jsonABC);
            }


			if (jsonobj.switchType === "Contact") {

                var cstatus = "";

                if (status === 0){
                    cstatus = "Closed";
                }

                if (status === 1){
                    cstatus = "Open";
                    io.emit('audio');
                }

                var abcdef = "";

                lastSet = epoch();

                idxHistory[idx] = {
                    "level" : "undefined",
                    "status" : cstatus,
                    "name" : idxname,
                    "type" : "Contact",
                    "lastSet" : lastSet
                };

                var abcdef = '{"doors":{"' + idx + '":{"Status":"' + cstatus + '","Name":"' + idxname + '"}}}';
                var jsonABC = JSON.parse(abcdef);
                io.emit('update',jsonABC);
            }



      if (jsonobj.Type === "Scene") {

                cstatus = "Deactivated";

                var abcdef = "";
                var abcdef = '{"scenes":{"' + jsonobj.idx + '":{"Status":"' + cstatus + '","Name":"' + jsonobj.Name + '"}}}';
                var jsonABC = JSON.parse(abcdef);
                io.emit('update',jsonABC);
      }



			if ((jsonobj.dtype === "Temp" || jsonobj.dtype === "Temp + Humidity" || jsonobj.dtype === "Thermostat") && idxname != "House Temperature Setpoint") {

				var x = new Date().getTime();

		                var f = parseFloat(level);
		                var f = f * 9 / 5 + 32;
		                f = f.toFixed(1);
		                f = parseFloat(f);


                    lastSet = epoch();

                    idxHistory[idx] = {
                        "level" : f,
                        "status" : "undefined",
                        "name" : idxname,
                        "type" : "Temp",
                        "lastSet" : lastSet
                    };

                    tempTemp = idxHistory[15].level - idxHistory[43].level;
                    tempTemp = Math.abs(tempTemp);

                    console.log(tempTemp);

                    if (tempTemp > 5){

                      myCommand = '{"command": "switchlight", "idx": ' + '37' + ', "switchcmd": "On", "level": 100 }';

                      switchLights(myCommand);

                      alertAutoAction = '{"autoEvent": "true", "idx": 37}';

                      autoAction(alertAutoAction);

                    } else {

                      myCommand = '{"command": "switchlight", "idx": ' + '37' + ', "switchcmd": "Off", "level": 0 }';

                      switchLights(myCommand);

                      alertAutoAction = '{"autoEvent": "true", "idx": 37}';

                      autoAction(alertAutoAction);

                    }


				io.emit('chart', {
						x: x,
						y: f,
						idx: idx,
						idxname: idxname
					});

				//console.log('charted x: ' + x + ' y: ' + f);

            }

        });

        mqttClient.subscribe('domoticz/autoAction', function() {

            mqttClient.on('message', function(topic, message, packet) {

                var jsonobj = JSON.parse(message);

                lastSet = epoch();

                idxHistory[jsonobj.idx] = {
                  "lastSet" : lastSet,
                  "humanSet" : false
                };

            });

        });

    });
});

io.on('connection', function(socket){

  io.emit('wit', config.wit.key);

  idxMap.dimmers.items.forEach(function(item) {
		myCommand = '{"command": "getdeviceinfo", "idx": ' + item + ' }';
		mqttClient.publish('domoticz/in', myCommand);
	});

	idxMap.doors.items.forEach(function(item) {
		myCommand = '{"command": "getdeviceinfo", "idx": ' + item + ' }';
		mqttClient.publish('domoticz/in', myCommand);
	});

	idxMap.fans.items.forEach(function(item) {
		myCommand = '{"command": "getdeviceinfo", "idx": ' + item + ' }';
		mqttClient.publish('domoticz/in', myCommand);
	});

	idxMap.temps.items.forEach(function(item) {
		myCommand = '{"command": "getdeviceinfo", "idx": ' + item + ' }';
		mqttClient.publish('domoticz/in', myCommand);
	});

  idxMap.scenes.items.forEach(function(item) {
		myCommand = '{"command": "getsceneinfo", "idx": ' + item + ' }';
		mqttClient.publish('domoticz/in', myCommand);
	});


	socket.on('dimCommand', function(msg){

		dimLights(msg);

	});

	socket.on('dimPoll', function(msg){

    pollLights(msg);

	});

	socket.on('switchCommand', function(msg){

		switchLights(msg);

	});

  socket.on('voice', function(msg){

    if (msg.outcome.intent == "light_on_off") {

      //console.log(msg.outcome.entities.room.value);

      var roomName = msg.outcome.entities.room.value;
      var binaryAction = msg.outcome.entities.binarySwitch.value;
      //console.log(binaryAction);
      var device = idxMap.wit.devices[roomName];

      if (binaryAction == "on") {
        myCommand = '{"command": "switchlight", "idx": ' + device + ', "switchcmd": "On", "level": 100 }';
        dimLights(myCommand);
      }

      if (binaryAction == "off") {
        myCommand = '{"command": "switchlight", "idx": ' + device + ', "switchcmd": "Off", "level": 0 }';
        dimLights(myCommand);
      }

    }






    //mqttClient.publish('domoticz/in', msg);

	});




});



http.listen(runPort, function(){
  console.log('listening on *:' + runPort);
});
