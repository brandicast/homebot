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
                        channelId: 1617614710,
                        channelSecret: 'ef099e1e2bd3fa9e9207d89eca8ea964',
                        channelAccessToken: 'Q6gHlttD7UhYxxKWirRghT9NiguF1e5jiGqOCbaNpNmma8c+BXXyRmlXPyzAvLsvHWkc/wZYKfH9pbJpmKR+oHHsu24ac9BhVIrcLHCV+U4rBAomcU3vnEfoiiU9Qurx7SCBikcOJ7hhnc2QsSCLjAdB04t89/1O/w1cDnyilFU='
                }, 
                port: 9111,
                resource_folder: "./resources",
                member_profile: "member.json",
                welcome_join_string: "歡迎 $USER 加入麵包國 !",
                welcome_string: "歡迎 $USER 回來麵包國 !",
                service_is_up_string: "麵包起床了 !",
                location_not_support: "麵包知道這個地點，可是麵包國的城門是關著，等開了我再過去看看。",
                image_not_support: "麵包還看不懂照片，讓我回去學習一下",
                service_not_support: " 麵包還不會這個，你要教我嗎?  那得跟駝駝說了。",
                try_to_open_front_door: "好的，麵包開開看 !",
                fail_to_open_front_door: "麵包好像打不開了 !"

        },
        ai:{
                enable: true,
                url: 'http://127.0.0.1:8888/chat/id/'
        },
        mqtt: {
                enable: true,
                url: 'mqtt://192.168.68.57',
                port: 1883,
                topic_for_iot: 'brandon/iot/zwave/philio/event/#',
                topic_for_pico: 'brandon/iot/pico/gate',
                client_id: 'homebot'
        }, 
        eng: {
                resource_folder: "./resources",
                basic: "ttc_1200.json",
                advance: "ttc_800.json",
                base_url: "http://www.taiwantestcentral.com/WordList"
        }
}