/*
 *  Refer to https://developers.line.biz/en/reference/messaging-api/#message-objects 
 *  Lazy way to provide the message template.  Could've broke down the flex message to container/component etc....but....perhaps not now.
 */
module.exports = {
    text:
    {
        type: "text",
        text: "Hi ! I am Bot. You are not suppose to see this !"
    },
    sticker: {
        type: "sticker",
        packageId: "1",
        stickerId: "13"
    },
    image: {
        type: "image",
        originalContentUrl: "https://example.com/original.jpg",
        previewImageUrl: "https://example.com/preview.jpg"
    },
    video: {
        type: "video",
        originalContentUrl: "https://example.com/original.mp4",
        previewImageUrl: "https://example.com/preview.jpg",
        trackingId: "track-id"
    },
    audio: {
        type: "audio",
        originalContentUrl: "https://example.com/original.m4a",
        duration: 60000
    },
    location: {
        type: "location",
        title: "my location",
        address: "1-6-1 Yotsuya, Shinjuku-ku, Tokyo, 160-0004, Japan",
        latitude: 35.687574,
        longitude: 139.72922
    },
    imagemap: {
        type: "imagemap",
        baseUrl: "https://example.com/bot/images/rm001",
        altText: "This is an imagemap",
        baseSize: {
            width: 1040,
            height: 1040
        },
        video: {
            originalContentUrl: "https://example.com/video.mp4",
            previewImageUrl: "https://example.com/video_preview.jpg",
            area: {
                x: 0,
                y: 0,
                width: 1040,
                height: 585
            },
            externalLink: {
                linkUri: "https://example.com/see_more.html",
                label: "See More"
            }
        },
        actions: [
            {
                type: "uri",
                linkUri: "https://example.com/",
                area: {
                    x: 0,
                    y: 586,
                    width: 520,
                    height: 454
                }
            },
            {
                type: "message",
                text: "Hello",
                area: {
                    x: 520,
                    y: 586,
                    width: 520,
                    height: 454
                }
            }
        ]
    },
    template: {
        button: {
            "type": "template",
            "altText": "This is a buttons template",
            "template": {
                "type": "buttons",
                "thumbnailImageUrl": "https://example.com/bot/images/image.jpg",
                "imageAspectRatio": "rectangle",
                "imageSize": "cover",
                "imageBackgroundColor": "#FFFFFF",
                "title": "Menu",
                "text": "Please select",
                "defaultAction": {
                    "type": "uri",
                    "label": "View detail",
                    "uri": "http://example.com/page/123"
                },
                "actions": [
                    {
                        "type": "postback",
                        "label": "Buy",
                        "data": "action=buy&itemid=123"
                    },
                    {
                        "type": "postback",
                        "label": "Add to cart",
                        "data": "action=add&itemid=123"
                    },
                    {
                        "type": "uri",
                        "label": "View detail",
                        "uri": "http://example.com/page/123"
                    }
                ]
            }
        },
        confirm: {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "text": "Are you sure?",
                "actions": [
                    {
                        "type": "message",
                        "label": "Yes",
                        "text": "yes"
                    },
                    {
                        "type": "message",
                        "label": "No",
                        "text": "no"
                    }
                ]
            }
        },
        carousel: {
            "type": "template",
            "altText": "this is a carousel template",
            "template": {
                "type": "carousel",
                "columns": [
                    {
                        "thumbnailImageUrl": "https://example.com/bot/images/item1.jpg",
                        "imageBackgroundColor": "#FFFFFF",
                        "title": "this is menu",
                        "text": "description",
                        "defaultAction": {
                            "type": "uri",
                            "label": "View detail",
                            "uri": "http://example.com/page/123"
                        },
                        "actions": [
                            {
                                "type": "postback",
                                "label": "Buy",
                                "data": "action=buy&itemid=111"
                            },
                            {
                                "type": "postback",
                                "label": "Add to cart",
                                "data": "action=add&itemid=111"
                            },
                            {
                                "type": "uri",
                                "label": "View detail",
                                "uri": "http://example.com/page/111"
                            }
                        ]
                    },
                    {
                        "thumbnailImageUrl": "https://example.com/bot/images/item2.jpg",
                        "imageBackgroundColor": "#000000",
                        "title": "this is menu",
                        "text": "description",
                        "defaultAction": {
                            "type": "uri",
                            "label": "View detail",
                            "uri": "http://example.com/page/222"
                        },
                        "actions": [
                            {
                                "type": "postback",
                                "label": "Buy",
                                "data": "action=buy&itemid=222"
                            },
                            {
                                "type": "postback",
                                "label": "Add to cart",
                                "data": "action=add&itemid=222"
                            },
                            {
                                "type": "uri",
                                "label": "View detail",
                                "uri": "http://example.com/page/222"
                            }
                        ]
                    }
                ],
                "imageAspectRatio": "rectangle",
                "imageSize": "cover"
            }
        },
        image_carousel: {
            "type": "template",
            "altText": "this is a image carousel template",
            "template": {
                "type": "image_carousel",
                "columns": [
                    {
                        "imageUrl": "https://example.com/bot/images/item1.jpg",
                        "action": {
                            "type": "postback",
                            "label": "Buy",
                            "data": "action=buy&itemid=111"
                        }
                    },
                    {
                        "imageUrl": "https://example.com/bot/images/item2.jpg",
                        "action": {
                            "type": "message",
                            "label": "Yes",
                            "text": "yes"
                        }
                    },
                    {
                        "imageUrl": "https://example.com/bot/images/item3.jpg",
                        "action": {
                            "type": "uri",
                            "label": "View detail",
                            "uri": "http://example.com/page/222"
                        }
                    }
                ]
            }
        }
    },
    flex2: {
        common: {
            "type": "flex",
            "altText": "麵包來教會考單字",
            "contents": {}
        },
        container: {
            carousel: {
                type: "carousel",
                contents: []
            },
            bubble: {
                "type": "bubble",
                "header": {
                    "type": "box",
                    "layout": "vertical",  // this is must have
                    "contents": [
                        {
                            "type": "text",
                            "text": "Header text",
                            "weight": "bold", 
                            "size":"3xl"
                        }
                    ],
                    "alignItems": "center",
                    "backgroundColor": "#b39b5e"
                },
                "hero": {
                    "type": "image",
                    "url": "https://images.squarespace-cdn.com/content/v1/5c1afbd1266c07479bc41525/1546915375772-G6YTQXMOHXN5G92J1BD9/image-asset.png?format=500w"
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "Body text",
                            "size":"lg"
                        }
                    ],
                    "alignItems": "flex-start",
                    "spacing": "xxl",
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "sm",
                    "contents": [
                       {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [],
                            "margin": "sm"
                       },
                      {
                        "type": "button",
                        "style": "link",
                        "height": "sm",
                        "action": {
                          "type": "uri",
                          "label": "相關考題",
                          "uri": "https://line.me/"
                        }
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [],
                        "margin": "sm"
                      }
                    ],
                    "flex": 0
                  }

            }
        }
    },
    flex: {
        common: {
            "type": "flex",
            "altText": "Flex Message from Mimosa",
            "contents": {}
        },
        container: {
            carousel: {
                type: "carousel",
                contents: []
            },
            bubble: {
                "type": "bubble",
                "header": {
                    "type": "box",
                    "layout": "vertical",  // this is must have
                    "contents": [
                        {
                            "type": "text",
                            "text": "Header text"
                        }
                    ],
                    "alignItems": "center",
                    "backgroundColor": "#b39b5e"
                },
                "hero": {
                    "type": "image",
                    "url": "https://images.squarespace-cdn.com/content/v1/5c1afbd1266c07479bc41525/1546915375772-G6YTQXMOHXN5G92J1BD9/image-asset.png?format=500w"
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "Body text"
                        }
                    ],
                    "alignItems": "center"
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "Footer text"
                        }
                    ],
                    "alignItems": "center",
                    "backgroundColor": "#b39b5e"
                },

            }
        }
    },
    quickReply: {
        "items": [
            {
                "type": "action",
                "action": {
                    "type": "message",
                    "label": "open front door",
                    "text": "(OPEN_FRONT_DOOR)"
                }

            },
            {
                "type": "action",
                "action": {
                    "type": "message",
                    "label": "status",
                    "text": "(status)"
                }

            },
            {
                "type": "action",
                "action": {
                    "type": "message",
                    "label": "raw message",
                    "text": "(raw)"
                }

            },
            {
                "type": "action",
                "action": {
                    "type": "cameraRoll",
                    "label": "Send photo"
                }
            },
            {
                "type": "action",
                "action": {
                    "type": "camera",
                    "label": "Open camera"
                }
            }

        ]
    }


}