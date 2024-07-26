const config  = require('./config.js');
var g = require('./globals.js');
const log4js = require("log4js");
log4js.configure (config.log4js_set) ;
const logger =  log4js.getLogger("mqtt_agent.js") ;

var mqtt  = require ('mqtt');

var opt =  {
    port:config.mqtt.port,
    clientId: config.mqtt.client_id
};

var client = mqtt.connect (config.mqtt.url, opt);

// Listen to any command from MQTT to perform action.
// Subscribe to the topic config.mqtt.topic_cmd
client.on ('connect', function ()  {
    logger.debug ('Connected to MQTT broker') ;
    client.subscribe (config.mqtt.topic_for_iot) ;
}
);

// This is the action to perform when receiving command from config.mqtt.topic_cmd
client.on ('message', function (topic, msg){
    logger.debug ('Receiving from [' + topic + '] with message : ' + msg)
    g.database[topic] = JSON.parse(msg) ;
});



exports.publish = function (mqtt_topic, content) {
    
    logger.debug("Publishing message to topic : " + mqtt_topic + " with content : " + content);
    var result = 1
    /*
    client.publish(mqtt_topic, content,  (err) => {
        if (err) {
          result = 0
        } 
        //client.end()
      });
    */

    return result;
}


