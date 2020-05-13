const linebot = require('linebot');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  verify: true,
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);
let magicNum = 0;
bot.on('message', function (event) {
  console.log(event);

  if (event.message.text.toLowerCase().includes('lala')) {
    const removeLalaMsg = event.message.text
      .toLowerCase()
      .split('lala')
      .join(' ');
    const replyMsg = `偶縮 :${removeLalaMsg}`;
    event
      .reply(replyMsg)
      .then((data) => console.log('Success', data))
      .catch((error) => console.log('Error', error));
  }

  if (event.message.text.toLowerCase().includes('guess')) {
    if (event.message.text.toLowerCase().includes('guess start')) {
      magicNum = Math.floor(Math.random() * 100);
      event.reply('重新洗牌了!!');
    }
    const removeLalaMsg = guessRes(event.message.text);
    const replyMsg = `偶縮 :${removeLalaMsg}`;
    event
      .reply(replyMsg)
      .then((data) => console.log('Success', data))
      .catch((error) => console.log('Error', error));
  }
});

function guessRes(guessNum) {
  guessNum = parseInt(guessNum.split('guess')[1]);
  if (guessNum > magicNum) {
    console.log('too big');
    return 'too big';
  } else if (guessNum < magicNum) {
    console.log('too small');
    return 'too small';
  } else if (guessNum === magicNum) {
    console.log('win');
    return 'win';
  }
}

// YYY.join(" ")
// data_a01.includes('L@')
// data_a01.indexOf('lalal@n')

// Bot所監聽的webhook路徑與port
// bot.listen('/', 3000, function () {
//   console.log('[BOT已準備就緒]');
// });

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
