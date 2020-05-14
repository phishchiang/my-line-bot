const linebot = require('linebot');
const express = require('express');
const dotenv = require('dotenv');
const Transaction = require('./models/guessVal');
dotenv.config({ path: './config/config.env' });
const connectDB = require('./config/db');
connectDB();

const line = require('@line/bot-sdk');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

/*
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
