module.exports = {
        log4js_set: {
                appenders: {
                        out: {
                                type: 'stdout'
                        },
                        app: {
                                type: 'file',
                                filename: 'logs/homebot',
                                maxLogSize: 4096000,
                                backups: 9
                        }
                },
                categories: {
                        default: {
                                appenders: ['out', 'app'],
                                level: 'debug'
                        }
                }
        },
        linebot: {
                configuration: {
                        channelId:          process.env.LINE_CHANNEL_ID,
                        channelSecret:      process.env.LINE_CHANNEL_SECRET,
                        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
                },
                port:                  parseInt(process.env.LINE_PORT) || 9111,
                resource_folder:       "./resources",
                member_profile:        "member.json",
                welcome_join_string:   "歡迎 $USER 加入麵包國 !",
                welcome_string:        "歡迎 $USER 回來麵包國 !",
                service_is_up_string:  "麵包起床了 !",
                no_data_string:        "目前還沒有任何感測器資料",
                location_not_support:  "麵包知道這個地點，可是麵包國的城門是關著，等開了我再過去看看。",
                image_not_support:     "麵包還看不懂照片，讓我回去學習一下",
                service_not_support:   "麵包還不會這個，你要教我嗎? 那得跟駝駝說了。",
                try_to_open_front_door:  "好的，麵包開開看 !",
                fail_to_open_front_door: "麵包好像打不開了 !"
        },
        ai: {
                enable: process.env.AI_ENABLE !== 'false',
                url:    process.env.AI_URL || 'http://127.0.0.1:8888/chat/id/'
        },
        mqtt: {
                enable:              process.env.MQTT_ENABLE !== 'false',
                url:                 process.env.MQTT_URL    || 'mqtt://192.168.68.57',
                port:                parseInt(process.env.MQTT_PORT) || 1883,
                client_id:           process.env.MQTT_CLIENT_ID          || 'homebot',
                topic_for_iot:       process.env.MQTT_TOPIC_FOR_IOT      || 'brandon/iot/zwave/philio/event/#',
                topic_for_pico:      process.env.MQTT_TOPIC_FOR_PICO     || 'brandon/iot/pico/gate',
                topic_for_homebot:   process.env.MQTT_TOPIC_FOR_HOMEBOT  || 'brandon/homebot/log'
        },
        eng: {
                resource_folder: "./resources",
                basic:           "ttc_1200.json",
                advance:         "ttc_800.json",
                base_url:        "http://www.taiwantestcentral.com/WordList"
        }
}