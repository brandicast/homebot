const config = require('./config.js');
const log4js = require('log4js');
log4js.configure(config.log4js_set);
const logger = log4js.getLogger('mqtt_agent.js');

// No-op fallback：MQTT 停用時避免 runtime crash
exports.publish = function (mqtt_topic, content) {
    logger.debug('MQTT is disabled. Skipping publish to: ' + mqtt_topic);
    return Promise.resolve(false);
};

if (config.mqtt.enable) {
    const mqtt = require('mqtt');
    const g = require('./globals.js');

    const opt = {
        port:     config.mqtt.port,
        clientId: config.mqtt.client_id
    };

    const client = mqtt.connect(config.mqtt.url, opt);

    client.on('connect', function () {
        logger.debug('Connected to MQTT broker');
        client.subscribe(config.mqtt.topic_for_iot);
    });

    client.on('message', function (topic, msg) {
        logger.debug('Receiving from [' + topic + '] with message : ' + msg);
        g.database[topic] = JSON.parse(msg);
    });

    // 覆寫 export，改為 Promise-based
    exports.publish = function (mqtt_topic, content) {
        logger.debug('Publishing to [' + mqtt_topic + '] : ' + content);
        return new Promise((resolve, reject) => {
            client.publish(mqtt_topic, content, (err) => {
                if (err) {
                    logger.error('Publish failed: ' + err.message);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };
}