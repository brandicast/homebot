var config = require("./config.js");

const log4js = require("log4js");
log4js.configure(config.log4js_set);
const logger = log4js.getLogger("Line Message Packager");


var g = require('./globals.js');

let message = require("./lib/line_message_template.js");

function deepClone(json_obj) { // 本來是用 Object.assign ，但會有shallow clone的問題
    return JSON.parse(JSON.stringify(json_obj));
}

function getMessageShell() {
    var response = deepClone(message.flex.common);
    var carousel = deepClone(message.flex.container.carousel);
    response.contents = carousel;
    return response;
}

function addMessage(shell, eventObject) {
    var device_id = eventObject.uid;
    var funcType = eventObject.funcType;
    var productCode = eventObject.productCode;
    var eventCode = eventObject.eventCode;
    var battery = eventObject.battery;

    // Header  1
    var bubble = deepClone(message.flex.container.bubble);
    bubble.header.contents[0].text = g.mapping_table.philio.function_type[funcType] ? g.mapping_table.philio.function_type[funcType] : "Not  Available";
    bubble.header.contents[0].text += "(" + eventObject.funcName + ")";

    // Header 2
    var extra_text = deepClone(message.text);
    extra_text.text = "(" + device_id + ")";
    bubble.header.contents.push(extra_text);

    logger.debug("fun type: " + funcType + " -> " + g.mapping_table.philio.function_type[funcType]);
    logger.debug("product code: " + productCode + " -> " + productCode.toString(16).toUpperCase().padStart(8, "0"));

    // Hero (image)
    bubble.hero.url = g.mapping_table.philio.productCode[productCode.toString(16).toUpperCase().padStart(8, "0")].img;

    // Body
    logger.debug("event code: " + eventCode + " -> " + g.mapping_table.philio.eventCode[eventCode]);
    switch (eventCode) {
        case 4101: { //PIR
                bubble.body.contents[0].text = g.mapping_table.philio.function_type[funcType] + " is  triggered"
            break;
        }
        case 4801: { //Temperature
            var unit = eventObject.dataUnit;
            var sensorValue = eventObject.sensorValue;
            if (unit == 2)
                bubble.body.contents[0].text = (((sensorValue * 0.1) - 32) * 5 / 9).toPrecision(3) + "°C";
            else
                bubble.body.contents[0].text = (sensorValue * 0.1).toPrecision(3) + "°C";
            break;
        }
        case 4802: { // Illumination
            var unit = eventObject.dataUnit;
            var sensorValue = eventObject.sensorValue;
            bubble.body.contents[0].text = sensorValue + "" + ((unit == 3) ? "%" : " lux");
            break;
        }
        case 4804: { // Meter report
            if (funcType == 22) {
                bubble.body.contents[0].text = g.mapping_table.philio.function_type[funcType] + " is " + (eventObject.basicValue == 0 ? "Off" : "On");
                var meter_report = deepClone(message.text);
                meter_report.text = JSON.stringify(eventObject.meter);
                bubble.body.contents.push(meter_report);

            } else
                bubble.body.contents[0].text = g.mapping_table.philio.eventCode[eventCode]; //  funcType == 44, but no definition in document.  -> scene 
            break;
        }
        case 5002: { // Meter switch  
            if (funcType == 22)
                bubble.body.contents[0].text = g.mapping_table.philio.function_type[funcType] + " is " + (eventObject.basicValue == 0 ? "Off" : "On");
            else
                bubble.body.contents[0].text = g.mapping_table.philio.eventCode[eventCode]; //  funcType == 44, but no definition in document.  -> scene 
            break;
        }
        case 5010: { // Device Wake up
            bubble.body.contents[0].text = g.mapping_table.philio.function_type[funcType] + " is  waked up"
        break;
    }
        default: {
            if (g.mapping_table.philio.eventCode[eventCode])
                bubble.body.contents[0].text = g.mapping_table.philio.eventCode[eventCode];
            else    
                bubble.body.contents[0].text = "New event code is found : " + eventCode;
            break;
        }
    }

    // Footer
    
    switch (battery) {
        case 255: { // device is AC adaptor
            bubble.footer.contents[0].text = "   Battery : AC adaptor";
            break;
        }
        case 238: { // device battery is low
            bubble.footer.contents[0].text = "   Battery : LOW  !!!";
            break;
        }
        default: { // battery level 0 -100
            bubble.footer.contents[0].text = "   Battery : " + battery + "%";
            break;
        }
    }

    var timestamp = Number(eventObject.timeStamp + "" + (eventObject.timeStamp_ms).toString().padStart(3, "0"));
    var d = new Date(timestamp);

    var time_string  = deepClone(message.text);
    //time_string.text = d.getFullYear() +"/"+(d.getMonth()+1)+"/"+d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":"  + d.getSeconds() ;
    time_string.text = d.toLocaleString('en-US', { timeZone: 'Asia/Taipei'});
    bubble.footer.contents.push(time_string);


    shell.contents.contents.push(bubble); // 2 level contents.  first level is flex, 2nd level is carousel.
}



exports.getStatus = function () {
    logger.debug(g.database);
    var response;
    if (Object.keys(g.database).length === 0) {
        response = deepClone(message.text);
        response.text = config.linebot.no_data_string;
    } else {
        if (Object.values(g.database)) {
            response = getMessageShell()
            for (var k in g.database) {
                addMessage(response, g.database[k]);
            }
        }
    }
    logger.debug(JSON.stringify(response));
    return response;
}

exports.getRawData = function () {
    var response = deepClone(message.text);
    response.text = JSON.stringify(g.database)
    logger.debug("Raw data : " + response.text);
    return response;
}