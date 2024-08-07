
let config = require("../config.js");
const log4js = require("log4js");
log4js.configure(config.log4js_set);
const logger = log4js.getLogger(__filename.slice(__dirname.length + 1));

const url = 'https://api.line.me/v2/bot/chat/loading/start';  // Replace with your API endpoint


exports.sendLoadingAnimation = async function (chat_id, seconds=20) {
    var data = {
        'chatId' : chat_id,
        "loadingSeconds": seconds    // 20 is line default
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json','Authorization' : 'Bearer ' + config.linebot.configuration.channelAccessToken},
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        logger.error (`HTTP error! Status: ${response.status}`)
    }

    return response.json();  // parses JSON response into native JavaScript objects
}
