# nport 服務整合與問題修正日誌

## 執行目的
將 `nport` 服務加入本專案中做為本機伺服器的公開通道，設定對應 port 為 9111，並處理因為 Docker 環境導致的相依模組載入失敗問題。

## 執行過程與修改記錄

### 1. 修復 `homebot` 模組找不到 `config.js` 的錯誤
- **問題分析**：啟動 `homebot` 容器時，一直發生 `Error: Cannot find module './config.js'` 錯誤，該錯誤由 `lib/util.js` 引發。由於 `util.js` 位於 `lib` 目錄內，而 `config.js` 在專案的根目錄中。
- **解決方案**：修改 `/opt/homebot/lib/util.js` 的載入路徑，將 `require('./config.js')` 修正為 `require('../config.js')`，確保其正確參照上一層目錄的設定檔。

### 2. 更新 `nport` 的 Dockerfile
- **問題分析**：使用者原先建立的 `nport/Dockerfile` 包含多個 `CMD` 指令，且未正確按照使用者要求選擇語言與指定的 port。
- **解決方案**：修改了 `nport/Dockerfile`，以確保在執行 `nport` 指定 port 9111 時，自動藉由管線（pipe）傳遞輸入值 `1` 來選擇英文（English），修正為單一指令 `CMD sh -c "echo 1 | nport 9111"`。

### 3. 重建 Docker Images 與啟動
- 執行 `docker compose -f docker-compose.yml build` 成功完成 `homebot` 及 `nport` 的映像檔建置。
- 執行 `docker compose -f docker-compose.yml up -d` 啟動服務。
- 藉由 `docker logs homebot` 與 `docker logs nport` 確認兩個容器均已成功運行，`nport` 成功打通 9111 port 的穿透通道。

## 結論
修改已全數完成，`homebot` 不再發生路徑解析錯誤，`nport` 服務也如預期接受預設指令並順利執行。
