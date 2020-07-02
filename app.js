const express = require('express');
const line = require('@line/bot-sdk');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const axios = require('axios');
const connectDB = require('./config/db');
connectDB();

const five = require('johnny-five');
const board = new five.Board();
let led, tempIntervalId, bodyTemp, newBodyTemp;
let HexColor = '#000000';
// let magicNum = 0;
// let winner = false;
// let restart = false;
const AXIOS_URL_LOCAL = 'http://localhost:8080/';
const AXIOS_URL_REMOTE = 'https://line-bot-8421.herokuapp.com/';
const GUESS_API = 'api/v1/guessState/';
const TEMP_API = 'api/v1/tempState/';

const config = {
  channelId: process.env.CHANNEL_ID,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const configAxios = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const guessState = require('./routes/guessState');
const tempState = require('./routes/tempState');

// create LINE SDK client
const client = new line.Client(config);

const app = express();

const { HSLToHex } = require('./HSLToHex');

function boardHandler() {
  // Initialize the RGB LED
  led = new five.Led.RGB({
    pins: {
      red: 6,
      green: 5,
      blue: 3,
    },
  });

  // board.repl.inject({ led });

  // Turn it on and set the initial color
  led.on();
  led.color('#000000');

  let temperature = new five.Thermometer({
    controller: 'LM35',
    // controller: 'TMP36',
    pin: 'A0',
    freq: 2000,
  });

  function map_range(value, low1, high1, low2, high2) {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }

  temperature.on('data', async () => {
    const mapColorVal = map_range(temperature.C, 25, 40, 0, 360);
    HexColor = HSLToHex(mapColorVal, 100, 50);
    // console.log(`Temp is ${temperature.C}, remapVal is ${mapColorVal}`);
    // console.log(temperature.F);
    // console.log(temperature.K);
    bodyTemp = temperature.C;
    // console.log(data);
    // try {
    //   const data = await axios.put(`${AXIOS_URL_LOCAL}${TEMP_API}`, {
    //     temp: temperature.C,
    //   });
    // } catch (error) {
    //   console.log('error', error);
    //   // return client.replyMessage(event.replyToken, error);
    // }
  });

  // register a webhook handler with middleware
  app.post('/callback', line.middleware(config), (req, res) => {
    Promise.all(req.body.events.map(handleEvent))
      .then((result) => {
        // console.log(req.body.events);
        res.json(result);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).end();
      });
  });

  app.use(express.json());
  app.use('/api/v1/guessState', guessState);
  app.use('/api/v1/tempState', tempState);
}

board.on('ready', boardHandler);

const { guessRes } = require('./guessRes');

// event handler
async function handleEvent(event) {
  const led_colors = {
    red: 'red',
    green: 'green',
    blue: 'blue',
    purple: 'purple',
  };

  // console.log(event);
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // keyword light
  if (event.message.text.toLowerCase().includes('light')) {
    let replyMsg;
    const echoMsg = event.message.text.toLowerCase().split('light').join(' ');
    const userId = event.source.userId;
    const command = event.message.text.toLowerCase().split(' ')[1];
    if (Object.keys(led_colors).includes(command)) {
      // commands[command](msg, args);
      led.color(`${led_colors[command]}`);
      replyMsg = {
        type: 'text',
        text: `燈變${command}了`,
      };
    }

    if (command === 'blink') {
      led.blink(500);
      replyMsg = {
        type: 'text',
        text: `燈閃爍了`,
      };
    }

    if (command === 'on') {
      led.stop();
      led.color('FFFFFF');
      replyMsg = {
        type: 'text',
        text: `燈開了`,
      };
    }

    if (command === 'off') {
      led.color('000000');
      led.stop();
      replyMsg = {
        type: 'text',
        text: `燈關了`,
      };
    }

    console.log(event);
    return client.replyMessage(event.replyToken, replyMsg);
  }

  // keyword debug_guess
  if (event.message.text.toLowerCase().includes('guess')) {
    try {
      // fetch data from a url endpoint
      const data = await axios.post(
        `${AXIOS_URL_LOCAL}${GUESS_API}${event.source.groupId}`
      );
      if (data.data.data.length) {
        magicNum = data.data.data[0].amount;
        const guessAnswer = guessRes(event.message.text, magicNum);
        console.log(magicNum);
        // if no data guessAnswer === undefined
        if (guessAnswer === '答對了') {
          try {
            const data = await axios.put(
              `${AXIOS_URL_LOCAL}${GUESS_API}${event.source.groupId}`
            );
            console.log(data);
          } catch (error) {
            console.log('error', error);
            return client.replyMessage(event.replyToken, error);
          }
        }

        const replyMsg = {
          type: 'text',
          text: `${guessAnswer}!`,
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
        text: `${error}`,
      };
      return client.replyMessage(event.replyToken, replyMsg);
    }
  }

  // keyword debug_start
  if (event.message.text.toLowerCase().includes('start')) {
    // const userProfile = await client.getProfile(event.source.userId);
    magicNum = Math.floor(Math.random() * 10);

    // fetch data from a url endpoint
    const data = await axios.post(
      `${AXIOS_URL_LOCAL}${GUESS_API}${event.source.groupId}`
    );
    console.log(data.data.data);
    if (data.data.data.length) {
      try {
        // fetch data from a url endpoint
        const data = await axios.put(
          `${AXIOS_URL_LOCAL}${GUESS_API}${event.source.groupId}`,
          {
            restart: true,
          }
        );
        const replyMsg = { type: 'text', text: '重新洗牌了!!開始!!' };
        console.log(data);
        return client.replyMessage(event.replyToken, replyMsg);
      } catch (error) {
        console.log('error', error);
        const replyMsg = {
          type: 'text',
          text: `${error}`,
        };
        return client.replyMessage(event.replyToken, replyMsg);
      }
    } else {
      try {
        // fetch data from a url endpoint
        const data = await axios.post(
          `${AXIOS_URL_LOCAL}${GUESS_API}`,
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
          text: `猜數字遊戲開始!!`,
        };
        return client.replyMessage(event.replyToken, replyMsg);
      } catch (error) {
        console.log('error', error);
        const replyMsg = {
          type: 'text',
          text: ` ${error}`,
        };
        return client.replyMessage(event.replyToken, replyMsg);
      }
    }
  }

  // keyword debug_restart
  if (event.message.text.toLowerCase().includes('restart')) {
    try {
      // fetch data from a url endpoint
      const data = await axios.put(
        `${AXIOS_URL_LOCAL}${GUESS_API}${event.source.groupId}`,
        {
          restart: true,
        }
      );
      const replyMsg = { type: 'text', text: '重新洗牌了!!開始!!' };
      console.log(data);
      return client.replyMessage(event.replyToken, replyMsg);
    } catch (error) {
      console.log('error', error);
      const replyMsg = {
        type: 'text',
        text: ` ${error}`,
      };
      return client.replyMessage(event.replyToken, replyMsg);
    }
  }

  // keyword temp
  if (event.message.text.toLowerCase().includes('temp')) {
    const data = await axios.get(`${AXIOS_URL_LOCAL}${TEMP_API}`);
    const { isTesting, doneTest, temp } = data.data.data[0];
    let replyMsg;

    function IntervalRemindTest() {
      const message = {
        type: 'text',
        text: `Phish，趕快開始量體溫!!`,
      };
      client.pushMessage(event.source.groupId, message);
    }

    if (!isTesting && !doneTest) {
      // Keep remind me
      IntervalRemindTest();
      tempIntervalId = setInterval(IntervalRemindTest, 5000);
    }

    if (isTesting && !doneTest) {
      // Waiting the test result
      message = {
        type: 'text',
        text: `Phish已經在量體溫了稍等會!!`,
      };
      client.pushMessage(event.source.groupId, message);
    }

    if (doneTest) {
      if (temp < 38) {
        replyMsg = {
          type: 'text',
          text: `現在體溫攝氏 ${temp} 度，沒有發燒`,
        };
        client.replyMessage(event.replyToken, replyMsg);
      } else {
        replyMsg = {
          type: 'text',
          text: `現在體溫攝氏 ${temp} 度，發燒了喔!!`,
        };
        client.replyMessage(event.replyToken, replyMsg);
      }
    }
    replyMsg = {
      type: 'text',
      text: `GGG`,
    };
    // console.log(data.data.data[0].temp);
    // console.log(doneTest);
    // return client.replyMessage(event.replyToken, replyMsg);
  }

  // test push message
  if (event.message.text.toLowerCase().includes('monitor')) {
    const command = event.message.text.toLowerCase().split(' ')[1];

    async function IntervalFunc() {
      // console.log(i);
      const data = await axios.get(`${AXIOS_URL_LOCAL}${TEMP_API}`);
      const temp = await data.data.data[0].temp;
      const message = {
        type: 'text',
        text: `開始監控體溫!!! 現在體溫為${temp}度~`,
      };
      client.pushMessage(event.source.groupId, message);
      // console.log(event);
      // i += 3;
    }

    if (command === 'on') {
      IntervalFunc();
      tempIntervalId = setInterval(IntervalFunc, 5000);
    }
    if (command === 'off') {
      clearInterval(tempIntervalId);
      // console.log(tempIntervalId);
      const message = {
        type: 'text',
        text: `結束瘋狂監控!!`,
      };
      client.pushMessage(event.source.groupId, message);
    }
  }

  // keyword ok
  if (event.message.text.toLowerCase().includes('ok')) {
    const echoMsg = event.message.text.toLowerCase().split('ok').join(' ');
    const userId = event.source.userId;
    const userProfile = await client.getProfile(userId);
    console.log(userProfile);
    if (userProfile.displayName !== 'phish') return;
    clearInterval(tempIntervalId);
    const replyMsg = {
      type: 'text',
      text: `Phish已經在量體溫了稍等會!!`,
    };
    // console.log(userProfile);
    try {
      const getData = await axios.get(`${AXIOS_URL_LOCAL}${TEMP_API}`);
      console.log(getData.data.data[0]);
      const data = await axios.put(`${AXIOS_URL_LOCAL}${TEMP_API}`, {
        isTesting: true,
      });
    } catch (error) {
      console.log('error', error);
      // return client.replyMessage(event.replyToken, error);
    }

    async function myFunc() {
      const data = await axios.put(`${AXIOS_URL_LOCAL}${TEMP_API}`, {
        doneTest: true,
      });
      console.log(`Phish量好體溫了!!`);
    }

    setTimeout(myFunc, 10000);
    return client.replyMessage(event.replyToken, replyMsg);
  }

  // keyword lala
  if (event.message.text.toLowerCase().includes('lala')) {
    const echoMsg = event.message.text.toLowerCase().split('lala').join(' ');
    const userId = event.source.userId;
    const userProfile = await client.getProfile(userId);
    const replyMsg = {
      type: 'text',
      text: `偶縮, @${userProfile.displayName} ${echoMsg}`,
    };
    console.log(userProfile);
    return client.replyMessage(event.replyToken, replyMsg);
  }
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
