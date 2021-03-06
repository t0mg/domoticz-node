module.exports = {

  processEvents: function (jsonobj) {

    var idx = jsonobj.idx;
    var idxname = jsonobj.name;
    var status = jsonobj.nvalue;
    var level = jsonobj.svalue1;


    if (idx === 29){

      if (status === 1){

        flagListen = "60";
        //eventQueueIDX = 29;
        //eventQueueValue = 1;
        myCommand = '{"command": "getdeviceinfo", "idx": 60 }';
        mqttClient.publish('domoticz/in', myCommand);
        console.log("IDX 29 event ran");

      }

    }

    if (idx === 60 && flagListen == "60"){

          if (status === 0){

            flagListen = {};
            myCommand = '{"command": "switchlight", "idx": 7, "switchcmd": "On", "level": 100 }';
            dimLights(myCommand);
            myCommand = '{"command": "switchlight", "idx": 60, "switchcmd": "Off"}';
            switchLights(myCommand);
            console.log("IDX 60 event ran");

          }

    }

  }

}
