FROM node:20-alpine

RUN mkdir -p /opt/homebot

WORKDIR /opt/homebot

# 先複製 package.json 以利用 Docker 層快取
COPY package.json package-lock.json* /opt/homebot/

RUN npm ci --omit=dev

COPY *.js /opt/homebot/
COPY ./lib/ /opt/homebot/lib/

# resources 目錄改為執行時以 Volume 掛載，避免大型資料庫檔案進入 image
# 掛載方式請見 docker-compose.yml

EXPOSE 9111

CMD ["node", "bot.js"]
