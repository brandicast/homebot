FROM node:latest

RUN mkdir -p /opt/homebot

WORKDIR /opt/homebot

COPY package.json /opt/homebot

RUN npm install

COPY *.js /opt/homebot

COPY ./resources/ /opt/homebot/resources/
COPY ./lib/ /opt/homebot/lib/

EXPOSE 9111

CMD ["node", "bot.js"]
