# Homebot 優化執行記錄

**執行日期：** 2026-04-23  
**執行目的：** 依據程式碼分析報告，對 homebot 專案進行安全性、可維護性、效能及部署面的全面優化

---

## 🆕 新增檔案

| 檔案 | 說明 |
|------|------|
| `OPTIMIZATION.md` | 程式碼分析報告 |
| `.env.example` | 環境變數設定範本 |
| `docker-compose.yml` | Docker Compose 啟動設定 |
| `.dockerignore` | Docker build context 排除清單 |

---

## ✅ 已執行優化項目

### 🔴 #1 安全性 — `config.js`

- **變更**：將 `channelSecret`、`channelAccessToken`、MQTT URL 等機密資訊從硬編碼改為讀取環境變數（`process.env.*`）
- **補充**：補充原本缺少的兩個 key：
  - `config.linebot.no_data_string`（`line_message_formatter.js` 引用但未定義）
  - `config.mqtt.topic_for_homebot`（`bot.js` 多處引用但未定義）
- **搭配**：新增 `.env.example` 作為設定範本

### 🟠 #2 程式碼品質 — 未宣告變數

所有隱式全域變數改為 `const` 或 `let`，並在各檔案加上 `'use strict'`：

| 檔案 | 修正變數 |
|------|----------|
| `bot.js` | `text`, `id`, `log_msg`, `reply` 等 |
| `bot_member_manager.js` | `profile_filename`, `data` |
| `vocab_manager.js` | `path`, `path_basic`, `path_advance` |
| `lib/util.js` | `data`, `raw_json` |

### 🟠 #3 程式碼品質 — DRY 原則 (`bot.js`)

- 新增 `buildWordBubble(word, baseUrl)` helper function
- 刪除「麵包教我單字」與「麵包教我難一點的單字」兩個 case 中 ~40 行重複的邏輯
- 同時統一了兩個 case 的 URL 格式（補上 `/` 分隔符）

### 🟠 #4 程式碼品質 — `mqtt_agent.js` Promise

- `publish()` 改為回傳 `Promise`，錯誤處理正確反映
- 新增 MQTT 停用時的 no-op export（`Promise.resolve(false)`），避免 `mqtt.enable=false` 時 runtime crash

### 🟠 #5 程式碼品質 — `globals.js` 重複 key

- 刪除 `"01010003"` 的重複定義（原第 85 行），保留正確的第一個定義

### 🟠 #6 #7 程式碼品質 — `bot.js` 成員管理

- `unregisterMember`：`console.log` 改為 `logger.debug`
- `registerMember`：改用 ES6 解構語法，減少冗餘
- 新增 `getMemberDisplay(userId)` helper，統一「取得顯示名稱」的邏輯
- 新增 `logUserMessage(userId, text)` helper，統一訊息記錄與 MQTT 發佈

### 🟡 #10 效能 — `vocab_manager.js`

- `init()` 時將詞彙 keys 快取為陣列（`ttc_1200_keys`, `ttc_800_keys`）
- `randomBasicWord()` / `randomAdvanceWord()` 改為 O(1) key 查找
- 亂數取法改用 `Math.floor(Math.random() * length)` 確保均勻分佈

### 🟡 #11 效能 — `line_message_formatter.js`

- `deepClone()` 改用 Node.js 17+ 內建的 `structuredClone()`

### 🐳 #12 Docker — `Dockerfile`

- Base image：`node:latest` → `node:20-alpine`（體積更小、版本固定）
- `npm install` → `npm ci --omit=dev`（更嚴格、略去 devDependencies）
- `package.json` 層提前，充分利用 Docker 層快取
- `resources/` 目錄改為 Volume 掛載，大型 `.db` 不進入 image

### 🐳 #13 部署 — `package.json`

- 新增 `"start": "node bot.js"`
- 新增 `"dev": "node --watch bot.js"`（Node.js 18+ 內建 file watcher）

---

## 🔮 後續待規劃項目

| 項目 | 說明 |
|------|------|
| Command Map Pattern | 將 `handleTextMessage()` 的 switch/case 改為路由表，便於新增指令 |
| 新增功能 | 待確認需求後規劃 |

---

## ⚠️ 部署注意事項

1. **必須建立 `.env` 檔案**（參考 `.env.example`），填入實際的 LINE API 金鑰和 MQTT 設定
2. 舊版 `config_private.js` / `config_public.js`（已在 `.gitignore` 中）可以廢棄
3. `vocabulary.db` 需透過 docker-compose Volume 掛載，已在 `.dockerignore` 中排除
