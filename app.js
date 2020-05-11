const linebot = require('linebot');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

// 填入辨識Line Channel的資訊
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  verify: true,
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

bot.on('message', function (event) {
  console.log(event);
  const replyMsg = `Hello you just type :${event.message.text}`;
  event
    .reply(replyMsg)
    .then(function (data) {
      //console.log(event)
      console.log('Success', data);
    })
    .catch(function (error) {
      console.log('Error', error);
    });
});

// Bot所監聽的webhook路徑與port
// bot.listen('/', 3000, function () {
//   console.log('[BOT已準備就緒]');
// });

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
