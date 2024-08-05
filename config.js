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
                        channelId: {$ID},
                        channelSecret: {$SECRET},
                        channelAccessToken: {$TOKEN}
                }, 
                port: 9111,
                resource_folder: "./resources",
                member_profile: "member.json",
                welcome_join_string: "歡迎 $USER 加入麵包國 !",
                welcome_string: "歡迎 $USER 回來麵包國 !",
                service_is_up_string: "麵包起床了 !",
                service_not_support: "我還不會這個 ! 學習中 !!",
                try_to_open_front_door: "好的，麵包開開看 !",
                fail_to_open_front_door: "麵包好像打不開了 !"

        },
        ai:{
                enable: true,
                url: 'http://127.0.0.1:8888/chat/id/'
        },
        mqtt: {
                enable: false,
                url: 'mqtt://192.168.68.57',
                port: 1883,
                topic_for_iot: 'brandon/iot/zwave/philio/event/#',
                topic_for_pico: 'brandon/iot/pico/gate',
                client_id: 'homebot2'
        }, 
        eng: {
                resource_folder: "./resources",
                basic: "ttc_1200.json",
                advance: "ttc_800.json",
                base_url: "http://www.taiwantestcentral.com/WordList"
        }
}