'use strict';

const config = require('./config.js');
const log4js  = require('log4js');
log4js.configure(config.log4js_set);
const logger = log4js.getLogger(__filename.slice(__dirname.length + 1));

const path = require('path');
const fs   = require('fs');
const util = require('./lib/util.js');

// Read available member profiles
exports.loadMemberProfiles = function () {
    logger.debug('Starting loading member profiles');

    const profile_filename = path.join(__dirname, config.linebot.resource_folder, config.linebot.member_profile);
    const data = util.loadJSONFileSync(profile_filename);

    /*
     * It looks weird to make dir here. The reason is because we don't want
     * this to be checked every time a member joins. So we make the dir during startup.
     */
    fs.stat(config.linebot.resource_folder, (err) => {
        if (err) fs.mkdirSync(config.linebot.resource_folder);
    });

    logger.debug('Finish loading member profiles');
    return data;
};

exports.writeMemberProfiles = function (data) {
    try {
        const profile_filename = path.join(__dirname, config.linebot.resource_folder, config.linebot.member_profile);
        fs.writeFileSync(profile_filename, JSON.stringify(data));
        logger.debug('Writing member profiles');
    } catch (e) {
        logger.error('Writing member profile error : ' + e);
    }
};
