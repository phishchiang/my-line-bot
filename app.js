const express = require('express');
const line = require('@line/bot-sdk');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const axios = require('axios');
const connectDB = require('./config/db');
connectDB();

const config = {
  channelId: process.env.CHANNEL_ID,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const guessState = require('./routes/guessState');

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

// app.use(express.json());
app.use('/api/v1/guessState', guessState);

let magicNum = 0;
let winner = false;
let restart = false;
const configAxios = {
  headers: {
    'Content-Type': 'application/json',
  },
};
// event handler
async function handleEvent(event) {
  console.log(event);
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // keyword debug_guess
  if (event.message.text.toLowerCase().includes('guess')) {
    // const replyMsg = { type: 'text', text: 'debug mode' };
    const userProfile = await client.getProfile(event.source.userId);
    // return client.replyMessage(event.replyToken, replyMsg);

    try {
      // fetch data from a url endpoint
      const data = await axios.post(
        `https://line-bot-8421.herokuapp.com/api/v1/guessState/${event.source.groupId}`
      );
      if (data.data.data.length) {
        magicNum = data.data.data[0].amount;
        const guessAnswer = guessRes(event.message.text, magicNum);
        console.log(magicNum);
        // if no data guessAnswer === undefined
        if (guessAnswer === '答對了') {
          try {
            const data = await axios.put(
              `https://line-bot-8421.herokuapp.com/api/v1/guessState/${event.source.groupId}`
            );
            console.log(data);
          } catch (error) {
            console.log('error', error);
            return client.replyMessage(event.replyToken, error);
          }
        }

        const replyMsg = {
          type: 'text',
          text: `${userProfile.displayName},${guessAnswer}!`,
        };
        return client.replyMessage(event.replyToken, replyMsg);
      } else {
        const replyMsg = {
          type: 'text',
          text: '遊戲尚未開始',
        };
        return client.replyMessage(event.replyToken, replyMsg);
      }
    } catch (error) {
      console.log('error', error);
      const replyMsg = {
        type: 'text',
        text: `${userProfile.displayName}, ${error}`,
      };
      return client.replyMessage(event.replyToken, replyMsg);
    }
  }

  // keyword debug_start
  if (event.message.text.toLowerCase().includes('start')) {
    const userProfile = await client.getProfile(event.source.userId);
    magicNum = Math.floor(Math.random() * 10);

    // fetch data from a url endpoint
    const data = await axios.post(
      `https://line-bot-8421.herokuapp.com/api/v1/guessState/${event.source.groupId}`
    );
    console.log(data.data.data);
    if (data.data.data.length) {
      try {
        // fetch data from a url endpoint
        const data = await axios.put(
          `https://line-bot-8421.herokuapp.com/api/v1/guessState/${event.source.groupId}`,
          { restart: true }
        );
        const replyMsg = { type: 'text', text: '重新洗牌了!!開始!!' };
        console.log(data);
        return client.replyMessage(event.replyToken, replyMsg);
      } catch (error) {
        console.log('error', error);
        const replyMsg = {
          type: 'text',
          text: `${userProfile.displayName}, ${error}`,
        };
        return client.replyMessage(event.replyToken, replyMsg);
      }
    } else {
      try {
        // fetch data from a url endpoint
        const data = await axios.post(
          'https://line-bot-8421.herokuapp.com/api/v1/guessState',
          {
            groupId: event.source.groupId,
            winner: false,
            amount: magicNum,
          },
          configAxios
        );
        console.log(data.data);
        const replyMsg = {
          type: 'text',
          text: `${userProfile.displayName}, 猜數字遊戲開始!!`,
        };
        return client.replyMessage(event.replyToken, replyMsg);
      } catch (error) {
        console.log('error', error);
        const replyMsg = {
          type: 'text',
          text: `${userProfile.displayName}, ${error}`,
        };
        return client.replyMessage(event.replyToken, replyMsg);
      }
    }
  }

  // keyword debug_restart
  if (event.message.text.toLowerCase().includes('restart')) {
    // const replyMsg = { type: 'text', text: 'debug mode' };
    const userProfile = await client.getProfile(event.source.userId);
    // return client.replyMessage(event.replyToken, replyMsg);

    try {
      // fetch data from a url endpoint
      const data = await axios.put(
        `https://line-bot-8421.herokuapp.com/api/v1/guessState/${event.source.groupId}`,
        { restart: true }
      );
      const replyMsg = { type: 'text', text: '重新洗牌了!!開始!!' };
      console.log(data);
      return client.replyMessage(event.replyToken, replyMsg);
    } catch (error) {
      console.log('error', error);
      const replyMsg = {
        type: 'text',
        text: `${userProfile.displayName}, ${error}`,
      };
      return client.replyMessage(event.replyToken, replyMsg);
    }
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

  /*
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
  */
}

const guessRes = (guessNum, magicNum) => {
  guessNum = parseInt(guessNum.toLowerCase().split('guess')[1]);
  if (guessNum > magicNum) {
    console.log('太大了');
    return '太大了';
  } else if (guessNum < magicNum) {
    console.log('太小了');
    return '太小了';
  } else if (guessNum === magicNum) {
    console.log('答對了');
    winner = true;
    return '答對了';
  }
};

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
