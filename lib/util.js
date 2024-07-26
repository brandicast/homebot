let config = require("../config.js");
const log4js = require("log4js");
log4js.configure(config.log4js_set);
const logger = log4js.getLogger(__filename.slice(__dirname.length + 1));

const fs = require("fs");

exports.loadJSONFileSync = function (filePath) {
    logger.debug ("Loading JSON File Sync starts") ;
    data = {} ;
    if (fs.existsSync(filePath)) {
        raw_json = fs.readFileSync(filePath, "utf-8");
        if (raw_json)  
            data = JSON.parse(raw_json) ;
    }
    else {
        logger.info (filePath + " doesn't exist") ;
    }

    logger.debug ("Loading JSON File Sync finish") ;
    return data ;   
}