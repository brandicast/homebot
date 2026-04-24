'use strict';

const config       = require('./config.js');
const log4js       = require('log4js');
log4js.configure(config.log4js_set);
const logger = log4js.getLogger(__filename.slice(__dirname.length + 1));

const member_manager = require('./bot_member_manager.js');
const vocab_db       = require('./vocab_manager.js');
const linebot        = require('linebot');
const line_tools     = require('./lib/line_tools.js');
const composer       = require('./line_message_formatter.js');
const message        = require('./lib/line_message_template.js');
const mqtt_agent     = require('./mqtt_agent.js');

const bot = linebot(config.linebot.configuration);

let MEMBERS = {};

/**
 * 將詞彙資料轉換成 Flex Bubble 元件
 * @param {Array} word - [英文字, { chi, link }]
 * @param {string} baseUrl - 題目連結的 base URL
 */
function buildWordBubble(word, baseUrl) {
    const bubble = structuredClone(message.flex2.container.bubble);
    bubble.header.contents[0].text = word[0];
    delete bubble.hero; // 目前先不顯示圖片

    const contentArray = String(word[1].chi)
        .split('[')
        .filter(el => el.length > 0)
        .map(el => ({
            type:  'text',
            text:  el.indexOf(']') > 0 ? '[' + el : el,
            size:  'lg',
            align: 'start',
            wrap:  true,
        }));

    bubble.body.contents = contentArray;

    // 增加分類說明欄位
    const catStr = word[1].category;
    if (catStr && catStr.length === 3) {
        let labels = [];
        if (catStr[0] === '1') labels.push('高中學測單字');
        if (catStr[1] === '1') labels.push('國中會考800挑戰單字');
        if (catStr[2] === '1') labels.push('國中會考1200基礎單字');
        
        if (labels.length > 0) {
            bubble.body.contents.push({
                type: 'text',
                text: '分類: ' + labels.join('、'),
                size: 'xs',
                color: '#888888',
                wrap: true,
                margin: 'md'
            });
        }
    }

    if (word[1].link === 'None') {
        delete bubble.footer;
    } else {
        bubble.footer.contents[1].action.uri = baseUrl + word[1].link;
    }
    return bubble;
}

/**
 * 取得目前成員的顯示名稱（若已知），否則回傳 userId
 */
function getMemberDisplay(userId) {
    return (MEMBERS[userId] && MEMBERS[userId].displayName) ? MEMBERS[userId].displayName : userId;
}

/**
 * 記錄並發佈使用者訊息到 MQTT
 */
function logUserMessage(userId, text) {
    const id      = getMemberDisplay(userId);
    const log_msg = id + ' 說 ' + text;
    logger.info(log_msg);
    if (config.mqtt.enable)
        mqtt_agent.publish(config.mqtt.topic_for_homebot, log_msg).catch(err => logger.error(err));
}

/*
 * 處理文字訊息
 */
bot.on('message', function (event) {
    logger.debug(event.message.type);

    switch (event.message.type) {
        case 'text': {
            const text = event.message.text;
            handleTextMessage(event, text);
            break;
        }
        case 'sticker': {
            const response = structuredClone(message.sticker);
            if (event.message.packageId === '1')
                response.stickerId = event.message.stickerId;
            event.reply(response);
            break;
        }
        case 'location': {
            const response = structuredClone(message.text);
            response.text = event.message.address + ' (' + event.message.latitude + ',' + event.message.longitude + ')';
            event.reply(response);
            break;
        }
        case 'image':
        default: {
            const response = structuredClone(message.text);
            response.text = config.linebot.image_not_support;
            event.reply(response);
            break;
        }
    }
});

/**
 * 處理文字訊息的路由
 */
function handleTextMessage(event, text) {
    switch (text) {
        case '(STATUS)': {
            const response  = structuredClone(message.flex.common);
            const carousel  = structuredClone(message.flex.container.carousel);
            response.contents = carousel;
            const bubble1 = structuredClone(message.flex.container.bubble);
            const bubble2 = structuredClone(message.flex.container.bubble);
            bubble1.body.contents[0].text = 'I am bubble 1';
            bubble2.body.contents[0].text = 'I am bubble 2';
            carousel.contents = [bubble1, bubble2];
            logger.debug(JSON.stringify(response));
            event.reply(response);
            break;
        }
        case '(SINGLE)': {
            const response = structuredClone(message.flex.common);
            const bubble   = structuredClone(message.flex.container.bubble);
            bubble.body.contents[0].text = 'I am bubble 1';
            response.contents = bubble;
            logger.debug(JSON.stringify(response));
            event.reply(response);
            break;
        }
        case '(status)': {
            event.reply(composer.getStatus());
            break;
        }
        case '(raw)': {
            event.reply(composer.getRawData());
            break;
        }
        case '麵包 請幫忙開大門': {
            const response = structuredClone(message.text);
            response.text  = config.linebot.try_to_open_front_door;
            event.reply(response);

            // publish 現為 Promise，獨立處理結果不阻塞 reply
            mqtt_agent.publish(config.mqtt.topic_for_pico, 'OPEN').catch((err) => {
                logger.error('無法開大門: ' + err.message);
                const failMsg  = structuredClone(message.text);
                failMsg.text   = config.linebot.fail_to_open_front_door;
                event.reply(failMsg);
            });
            break;
        }
        case '麵包教我單字':
        case '麵包教我難一點的單字': {
            const isAdvance = text === '麵包教我難一點的單字';
            const word      = isAdvance ? vocab_db.randomAdvanceWord() : vocab_db.randomBasicWord();
            const bubble    = buildWordBubble(word, config.eng.base_url + '/');
            const response  = structuredClone(message.flex2.common);
            response.contents = bubble;
            event.reply(response);
            break;
        }
        default: {
            if (config.ai.enable) {
                line_tools.sendLoadingAnimation(event.source.userId);

                (async () => {
                    try {
                        const apiUrl = config.ai.url + event.source.userId + '?' + new URLSearchParams({ ask: text }).toString();
                        logger.debug(apiUrl);
                        const res    = await fetch(apiUrl);
                        const reply  = await res.text();
                        const response = structuredClone(message.text);
                        response.text  = reply;
                        logger.debug(reply);
                        event.reply(response);
                    } catch (err) {
                        logger.error(err.message);
                    }
                })();
            } else {
                const response = structuredClone(message.text);
                response.text  = text;
                event.reply(response);
            }

            logUserMessage(event.source.userId, text);
            break;
        }
    }
}

/*
 * 成員事件
 */
bot.on('leave', function (event) {
    logger.debug(event);
    const log_msg = getMemberDisplay(event.source.userId) + ' 離開麵包國了 !';
    logger.info(log_msg);
    mqtt_agent.publish(config.mqtt.topic_for_homebot, log_msg).catch(err => logger.error(err));
    unregisterMember(event.source.userId);
});

bot.on('join', function (event) {
    logger.debug(event);
    event.source.profile().then(function (profile) {
        registerMember(profile);
        const msg = config.linebot.welcome_join_string.replace('$USER', profile.displayName);
        event.reply(msg);

        const log_msg = getMemberDisplay(profile.userId) + ' 加入麵包國了 !';
        logger.info(log_msg);
        mqtt_agent.publish(config.mqtt.topic_for_homebot, log_msg).catch(err => logger.error(err));
    });
});

bot.on('follow', function (event) {
    logger.debug(event);
    event.source.profile().then(function (profile) {
        registerMember(profile);
        const msg = config.linebot.welcome_string.replace('$USER', profile.displayName);
        event.reply(msg);

        const log_msg = getMemberDisplay(profile.userId) + ' 回到麵包國了 !';
        logger.info(log_msg);
        mqtt_agent.publish(config.mqtt.topic_for_homebot, log_msg).catch(err => logger.error(err));
    });
});

bot.on('unfollow', function (event) {
    logger.debug(event);
    const log_msg = getMemberDisplay(event.source.userId) + ' 封鎖麵包國了 !';
    logger.info(log_msg);
    mqtt_agent.publish(config.mqtt.topic_for_homebot, log_msg).catch(err => logger.error(err));
    unregisterMember(event.source.userId);
});

/*
 * 成員管理
 */
function registerMember(profile) {
    const { userId, displayName, language, pictureUrl, statusMessage } = profile;
    MEMBERS[userId] = { userId, displayName, language, pictureUrl, statusMessage };

    logger.debug('MEMBERS: ' + Object.keys(MEMBERS));
    member_manager.writeMemberProfiles(MEMBERS);
}

function unregisterMember(userId) {
    delete MEMBERS[userId];
    logger.debug(`Member removed. Remaining: ${Object.keys(MEMBERS).length}`);
}

/****************************************************************************
 *    Main Start
 ****************************************************************************/
MEMBERS = member_manager.loadMemberProfiles();

vocab_db.init();

bot.listen('/', config.linebot.port);

logger.info('Running on port: ' + config.linebot.port);

setTimeout(function () {
    const sendMsg = config.linebot.service_is_up_string;
    if (Object.keys(MEMBERS).length > 0) {
        logger.info('Members online: ' + Object.keys(MEMBERS) + ' — ' + sendMsg);
    } else {
        logger.info('No member found');
    }
}, 3000);
