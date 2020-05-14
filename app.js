const express = require('express');
const line = require('@line/bot-sdk');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const Transaction = require('./models/guessVal');
const guessRes = require('./utlis/parseGuess');
const connectDB = require('./config/db');
connectDB();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

const app = express();

// register a webhook handler with middleware
app.post('/', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

let magicNum = 0;
let winner = false;
// event handler
async function handleEvent(event) {
  console.log(event);
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // keyword lala
  if (event.message.text.toLowerCase().includes('lala')) {
    const echoMsg = event.message.text.toLowerCase().split('lala').join(' ');
    const userId = event.source.userId;
    const userProfile = await client.getProfile(userId);
    const replyMsg = {
      type: 'text',
      text: `${userProfile.displayName}, ${echoMsg}`,
    };

    return client.replyMessage(event.replyToken, replyMsg);
  }

  // keyword restart
  if (event.message.text.toLowerCase().includes('restart')) {
    magicNum = Math.floor(Math.random() * 100);
    const replyMsg = { type: 'text', text: '重新洗牌了!!開始!!' };
    winner = false;
    return client.replyMessage(event.replyToken, replyMsg);
  }

  // keyword guess
  if (event.message.text.toLowerCase().includes('guess') && winner == false) {
    const guessAnswer = guessRes(event.message.text);
    const userId = event.source.userId;
    const userProfile = await client.getProfile(userId);
    const replyMsg = {
      type: 'text',
      text: `${userProfile.displayName}, ${guessAnswer}`,
    };

    return client.replyMessage(event.replyToken, replyMsg);
  }

  // keyword guess WINNER
  if (event.message.text.toLowerCase().includes('guess') && winner == true) {
    const guessAnswer = '遊戲結束';
    const userId = event.source.userId;
    const userProfile = await client.getProfile(userId);
    const replyMsg = {
      type: 'text',
      text: `${userProfile.displayName}, ${guessAnswer}`,
    };

    return client.replyMessage(event.replyToken, replyMsg);
  }
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

/*
const linebot = require('linebot');
const express = require('express');
const dotenv = require('dotenv');
const Transaction = require('./models/guessVal');
dotenv.config({ path: './config/config.env' });
const connectDB = require('./config/db');
connectDB();

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  verify: true,
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

let myData = {
  text: 'Good',
  amount: 50,
};
// POST method route
app.post('/guess', async (req, res) => {
  try {
    const transaction = await Transaction.create(myData);
    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    (error) => console.log('Error', error);
  }
});

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

  if (event.message.text.toLowerCase().includes('restart')) {
    magicNum = Math.floor(Math.random() * 100);
    const replyMsg = '偶縮 : 重新洗牌了!!開始!!';
    event.reply(replyMsg);
  }

  if (event.message.text.toLowerCase().includes('guess')) {
    const removeLalaMsg = guessRes(event.message.text);
    const replyMsg = `偶縮 :${removeLalaMsg}`;
    event
      .reply(replyMsg)
      .then((data) => console.log('Success', data))
      .catch((error) => console.log('Error', error));
  }
});

function guessRes(guessNum) {
  guessNum = parseInt(guessNum.toLowerCase().split('guess')[1]);
  if (guessNum > magicNum) {
    console.log('太大了');
    return '太大了';
  } else if (guessNum < magicNum) {
    console.log('太小了');
    return '太小了';
  } else if (guessNum === magicNum) {
    console.log('答對了!!');
    return '答對了!!';
  }
}


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
*/
