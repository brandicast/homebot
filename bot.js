
let config = require("./config.js");
const log4js = require("log4js");
log4js.configure(config.log4js_set);
const logger = log4js.getLogger(__filename.slice(__dirname.length + 1));

let member_manager = require("./bot_member_manager.js");
let vocab_db = require("./vocab_manager.js");


let linebot = require('linebot');

let composer = require("./line_message_formatter.js");
let message = require("./lib/line_message_template.js");

var mqtt_agent = require('./mqtt_agent.js');

let bot = linebot(config.linebot.configuration);

var MEMBERS = {};

/*  
    Reference :  See sample message in the bottom
  
*/
bot.on('message', function (event) {
    var response; // get text json from template
    logger.debug(event.message.type);
    switch (event.message.type) {
        case "text": {
            var text = event.message.text;
            switch (text) {
                case "(STATUS)": {
                    response = Object.assign({}, message.flex.common);
                    var carousel = Object.assign({}, message.flex.container.carousel);
                    response.contents = carousel;
                    var bubbles = [];
                    bubbles[0] = Object.assign({}, message.flex.container.bubble);
                    bubbles[1] = Object.assign({}, message.flex.container.bubble);
                    bubbles[0].body.contents[0].text = "I am bubble 1";
                    bubbles[1].body.contents[0].text = "I am bubble 2";
                    carousel.contents = bubbles;
                    logger.debug(JSON.stringify(response));
                    event.reply(response);
                    break;
                }
                case "(SINGLE)": {
                    response = Object.assign({}, message.flex.common);
                    var bubble = Object.assign({}, message.flex.container.bubble);
                    bubble.body.contents[0].text = "I am bubble 1";
                    response.contents = bubble;
                    logger.debug(JSON.stringify(response));
                    event.reply(response);
                    break;
                }
                case "(status)": {
                    response = composer.getStatus();
                    event.reply(response);
                    break;
                }
                case "(raw)": {
                    response = composer.getRawData();
                    event.reply(response);
                    break;
                }
                case "麵包 請幫忙開大門": {

                    response = Object.assign({}, message.text);
                    response.text = config.linebot.try_to_open_front_door

                    var code = mqtt_agent.publish(config.mqtt.topic_for_pico, "OPEN")
                    if (code == 0)
                        response.text = config.linebot.fail_to_open_front_door
                    event.reply(response);
                    break;
                }
                case "麵包教我單字": {
                    var word = vocab_db.randomBasicWord();

                    var bubble = Object.assign({}, message.flex2.container.bubble);
                    bubble.header.contents[0].text = word[0];

                    delete bubble.hero;   // No hero image for now 

                    target = word[1].chi;
                    //target = "[形容詞] 二的; [名詞] 二" ;
                    //target = "[副詞] 只,僅僅,才;不料;反而;可是,不過;要不是,若非 ; [連接詞] 可是,不過;要不是,若非 ";
                    //target = "哈哈"

                    explain_array = String(target).split("[");  //  explain_array = String(target).split(/(\[)/g);  -> this returns delimiter as item

                    content_array = [];

                    explain_array.forEach(element => {
                        if (element.length > 0) {
                            item = {};
                            item["type"] = "text";
                            if (element.indexOf("]") > 0)
                                element = "[" + element;
                            item["text"] = element;
                            item["size"] = "lg";
                            item["align"] = "start";
                            item["wrap"] = true;
                            content_array.push(item);
                        }
                    });
                    //bubble.body.contents[0].text = word[1].chi ;
                    bubble.body.contents = content_array;

                    if ("None" == word[1].link)
                        delete bubble.footer;
                    else
                        bubble.footer.contents[1].action.uri = config.eng.base_url + word[1].link;

                    response = Object.assign({}, message.flex2.common);
                    response.contents = bubble;

                    //logger.debug(JSON.stringify(response));
                    event.reply(response);

                    break;
                }
                case "麵包教我難一點的單字": {
                    var word = vocab_db.randomAdvanceWord();

                    var bubble = Object.assign({}, message.flex2.container.bubble);
                    bubble.header.contents[0].text = word[0];

                    delete bubble.hero;   // No hero image for now 

                    target = word[1].chi;

                    explain_array = String(target).split("[");  //  explain_array = String(target).split(/(\[)/g);  -> this returns delimiter as item

                    content_array = [];

                    explain_array.forEach(element => {
                        if (element.length > 0) {
                            item = {};
                            item["type"] = "text";
                            if (element.indexOf("]") > 0)
                                element = "[" + element;
                            item["text"] = element;
                            item["size"] = "lg";
                            item["align"] = "start";
                            item["wrap"] = true;
                            content_array.push(item);
                        }
                    });
                    //bubble.body.contents[0].text = word[1].chi ;
                    bubble.body.contents = content_array;

                    if ("None" == word[1].link)
                        delete bubble.footer;
                    else
                        bubble.footer.contents[1].action.uri = config.eng.base_url + word[1].link;

                    response = Object.assign({}, message.flex2.common);
                    response.contents = bubble;

                    //logger.debug(JSON.stringify(response));
                    event.reply(response);

                    break;
                }
                default: {
                    if (config.ai.enable) {
                        (async () => {
                            try {
                                const res = await fetch(config.ai.url + event.source.userId + "?" + new URLSearchParams({
                                    ask: text
                                }).toString());

                                logger.debug(config.ai.url + event.source.userId + "?" + new URLSearchParams({
                                    ask: text
                                }).toString())

                                reply = await res.text()
                                response = Object.assign({}, message.text);
                                response.text = reply;
                                logger.debug(reply)
                                event.reply(response);

                            } catch (err) {
                                logger.error(err.message); //can be console.error
                            }
                        })();
                    }
                    else {
                        response = Object.assign({}, message.text);
                        response.text = event.message.text;
                        event.reply(response);
                    }
                    //response["quickReply"] = message.quickReply ;
                    id = event.source.userId;
                    if (MEMBERS[id])
                        id = MEMBERS[id]["displayName"]
                    log_msg = id + " 說 " + event.message.text;
                    logger.info(log_msg);
                    if (config.mqtt.enable)
                        mqtt_agent.publish(config.mqtt.topic_for_homebot, log_msg);


                    break;
                }
            }

            break;
        }
        case "sticker": {
            response = Object.assign({}, message.sticker);;
            if (event.message.packageId == "1")
                response.stickerId = event.message.stickerId;
            event.reply(response);
            break;
        }
        case "location": {
            response = Object.assign({}, message.text);;
            response.text = event.message.address + " (" + event.message.latitude + "," + event.message.longitude + ")";
            event.reply(response);
            break
        }
        case "image": default: {
            response = Object.assign({}, message.text);;
            response.text = config.linebot.image_not_support;
            event.reply(response);
            break;
        }
    }

 
});


bot.on('leave', function (event) {
    logger.debug(event);
    id = event.source.userId;
    if (MEMBERS[id])
        id = MEMBERS[id]["displayName"]
    log_msg = id + " 說 " + " 離開麵包國了 !";
    logger.info(log_msg);
    mqtt_agent.publish(config.mqtt.topic_for_homebot, log_msg);
    unregisterMember(event.source.userId);

})

bot.on('join', function (event) {
    logger.debug(event);
    event.source.profile().then(function (profile) {
        registerMember(profile);
        var msg = config.linebot.welcome_join_string.replace("$USER", profile.displayName);
        event.reply(msg);

        id = event.source.userId;
        if (MEMBERS[id])
            id = MEMBERS[id]["displayName"]
        log_msg = id + " 加入麵包國了 !";

        logger.info(log_msg);
        mqtt_agent.publish(config.mqtt.topic_for_homebot, log_msg);
    });
})

bot.on('follow', function (event) {
    logger.debug(event);
    event.source.profile().then(function (profile) {
        registerMember(profile);
        var msg = config.linebot.welcome_string.replace("$USER", profile.displayName);
        event.reply(msg);

        id = event.source.userId;
        if (MEMBERS[id])
            id = MEMBERS[id]["displayName"]
        log_msg = id + " 回到麵包國了 !";

        logger.info(log_msg);
        mqtt_agent.publish(config.mqtt.topic_for_homebot, log_msg);
    });
})

bot.on('unfollow', function (event) {
    logger.debug(event);

    id = event.source.userId;
    if (MEMBERS[id])
        id = MEMBERS[id]["displayName"]
    log_msg = id + " 封鎖麵包國了 !";

    logger.info(log_msg);
    mqtt_agent.publish(config.mqtt.topic_for_homebot, log_msg);
    unregisterMember(event.source.userId);


})

function registerMember(profile) {
    var p = {};
    p["userId"] = profile.userId;
    p["displayName"] = profile.displayName;
    p["language"] = profile.language;
    p["pictureUrl"] = profile.pictureUrl;
    p["statusMessage"] = profile.statusMessage;
    MEMBERS[profile.userId] = p;

    logger.debug(JSON.stringify(MEMBERS));
    logger.debug("MEMBERS are: " + Object.keys(MEMBERS));

    member_manager.writeMemberProfiles(MEMBERS);

}

function unregisterMember(userId) {
    delete MEMBERS[userId];
    console.log(Object.keys(MEMBERS).length);
    logger.debug(JSON.stringify(MEMBERS));
}

setTimeout(function () {
    var sendMsg = config.linebot.service_is_up_string;
    if (Object.keys(MEMBERS).length > 0) {
        bot.broadcast(sendMsg);
        logger.info('send: ' + Object.keys(MEMBERS) + ':' + sendMsg);
    }
    else {
        logger.info('No member found');
    }

}, 3000);

/****************************************************************************
 *    Main Start
 ****************************************************************************/
MEMBERS = member_manager.loadMemberProfiles()

vocab_db.init();
/*
console.log (vocab_db.randomBasicWord()) ;
console.log (vocab_db.randomAdvanceWord()) ;
*/

bot.listen('/', config.linebot.port);

logger.info('Running on : ' + config.linebot.port);





/*
[Text]
{
  type: 'message',
  message: {
    type: 'text',
    id: '14839608892725',
    text: 'Hi',
    content: [Function (anonymous)]
  },
  timestamp: 1633076934007,
  source: {
    type: 'user',
    userId: 'U17f3c29570cb4be181aa7e82b86b3ba7',
    profile: [Function (anonymous)],
    member: [Function (anonymous)]
  },
  replyToken: 'c2d00beadb624f4ab48dcc8b6bd6a22c',
  mode: 'active',
  reply: [Function (anonymous)]
}



[Sticker]

 {
  type: 'message',
  message: {
    type: 'sticker',
    id: '14839571160316',
    stickerId: '13',
    packageId: '1',
    stickerResourceType: 'STATIC',
    keywords: [
      'thumb',    'nice',
      'thumbsup', 'good',
      'moon',     'cool',
      'OK',       'goodjob',
      'Awesome'
    ],
    content: [Function (anonymous)]
  },
  timestamp: 1633076497146,
  source: {
    type: 'user',
    userId: 'U17f3c29570cb4be181aa7e82b86b3ba7',
    profile: [Function (anonymous)],
    member: [Function (anonymous)]
  },
  replyToken: '7254a3d1a4c94a9e9df978744a920a8b',
  mode: 'active',
  reply: [Function (anonymous)]
}

 [Image]

 { type: 'message',
  message: {
    type: 'image',
    id: '14839575573040',
    contentProvider: { type: 'line' },
    content: [Function (anonymous)]
  },
  timestamp: 1633076548764,
  source: {
    type: 'user',
    userId: 'U17f3c29570cb4be181aa7e82b86b3ba7',
    profile: [Function (anonymous)],
    member: [Function (anonymous)]
  },
  replyToken: '1c4cd9cf028a41c89029b9d247ce0b14',
  mode: 'active',
  reply: [Function (anonymous)]
}


*/