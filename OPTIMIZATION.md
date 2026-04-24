# Homebot 程式碼優化分析報告

## 專案概覽

**homebot** 是一個 LINE Bot 應用程式，使用 Node.js 撰寫，主要功能包括：

- 接收 LINE 訊息並回覆
- 透過 MQTT 監聽並回報 Z-Wave IoT 裝置狀態（Philio 傳感器）
- 提供英文單字學習功能（TTC 1200 / TTC 800 詞彙庫）
- 開門控制（MQTT 指令）
- 連接外部 AI 服務進行對話

---

## 🔴 高優先級：安全性問題

### #1 機密資訊硬編碼在 `config.js`

**問題：** `channelSecret`、`channelAccessToken`、MQTT IP 直接寫在原始碼中，若 repo 不慎公開後果嚴重。

**解決：** 改用環境變數搭配 `.env` 檔案，詳見 `.env.example`。

---

## 🟠 中優先級：程式碼品質

### #2 大量未宣告（隱式全域）變數

涉及檔案：`bot.js`、`util.js`、`vocab_manager.js`、`bot_member_manager.js`

在 strict mode 下會直接報錯，也是潛在 bug 的來源。所有變數一律加上 `const` 或 `let`。

### #3 重複的單字教學邏輯（DRY 原則）

`「麵包教我單字」` 和 `「麵包教我難一點的單字」` 兩個 case 的處理邏輯幾乎完全相同（~40 行），抽取為 `buildWordBubble()` 共用函數。

### #4 `mqtt_agent.publish()` 的錯誤處理是無效的

`client.publish()` 是非同步操作，但 `result` 在 callback 執行前就已 `return 1`，結果永遠正確，錯誤訊息永遠不顯示。改為回傳 `Promise`。

### #5 `globals.js` 有重複的 productCode key

`"01010003"` 出現兩次（L65 和 L85），後者靜默覆蓋前者。刪除重複項目。

### #6 `unregisterMember` 混用 `console.log`

整個專案都用 log4js，這裡卻用 `console.log`，統一改為 logger。

### #7 `registerMember` 簡化

手動建構物件改用 ES6 解構語法。

### #8 `config.js` 缺少 key

- `config.mqtt.topic_for_homebot`：在 `bot.js` 中多處使用但未定義
- `config.linebot.no_data_string`：在 `line_message_formatter.js` 中使用但未定義

### #9 MQTT 停用時缺少 export

`mqtt.enable = false` 時 `exports.publish` 未定義，呼叫時會 runtime crash。補上 no-op export。

---

## 🟡 低優先級：效能優化

### #10 詞彙庫每次取詞都重建整個陣列

`Object.entries(ttc_1200)[seed]` 每次呼叫都建立完整陣列。改為在 `init()` 時快取 keys。同時用 `Math.floor(Math.random() * length)` 取代 `Math.round(...*10000) % length`，避免邊界分佈不均問題。

### #11 `deepClone` 改用 `structuredClone()`

Node.js 17+ 內建 `structuredClone()`，效能優於 `JSON.parse(JSON.stringify())`。

---

## 🐳 Docker / 部署

### #12 `Dockerfile` 使用 `node:latest`

改為 `node:20-alpine`，體積更小、版本固定、部署更穩定。

### #13 缺少 `package.json` start script

補上 `"start": "node bot.js"` 和 `"dev": "node --watch bot.js"`。

### 補充：`docker-compose.yml` 與 `.dockerignore`

依據開發規範（Docker 優先原則），補充這兩個檔案。

---

## 🔮 未來優化方向

### 指令路由表重構（Command Map Pattern）

當指令增加時，大型 switch/case 難以維護，建議改為：

```js
const textHandlers = {
    "(status)": (event) => event.reply(composer.getStatus()),
    "(raw)":    (event) => event.reply(composer.getRawData()),
    "麵包 請幫忙開大門": handleOpenDoor,
    "麵包教我單字":       (event) => handleWord(event, "basic"),
    "麵包教我難一點的單字": (event) => handleWord(event, "advance"),
};
```

---

*最後更新：2026-04-23*
