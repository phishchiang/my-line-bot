const express = require('express');
const line = require('@line/bot-sdk');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const axios = require('axios');
const connectDB = require('./config/db');
connectDB();

const five = require('johnny-five');
const board = new five.Board();
let led, tempIntervalId, bodyTemp;
let temperature;
const testingTime = 5000;
const resetTime = 60 * 1000; // 60 second to reset doneTest
const remindTime = 5000;
const tempSensorTime = 2000;

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

  temperature = new five.Thermometer({
    controller: 'LM35',
    // controller: 'TMP36',
    pin: 'A0',
    freq: tempSensorTime,
  });

  function map_range(value, low1, high1, low2, high2) {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }

  temperature.on('data', async () => {
    const getData = await axios.get(`${AXIOS_URL_LOCAL}${TEMP_API}`);
    // const { isTesting, doneTest, temp } = data.data.data[0];
    const tempDataObject = getData.data.data[0];
    bodyTemp = temperature.C;
    // console.log(tempDataObject);
    if (!tempDataObject.isTesting) return;
    const mapColorVal = map_range(temperature.C, 25, 40, 0, 360);
    // console.log(`Temp is ${temperature.C}, remapVal is ${mapColorVal}`);
    // console.log(temperature.F);
    // console.log(temperature.K);

    try {
      const data = await axios.put(`${AXIOS_URL_LOCAL}${TEMP_API}`, {
        ...tempDataObject,
        temp: temperature.C,
      });
    } catch (error) {
      console.log('error', error);
      // return client.replyMessage(event.replyToken, error);
    }
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
  // console.log(event);
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
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
      led.color('#FF0000');
      led.strobe(500);
      const message = {
        type: 'text',
        text: `Hey Phish，check your body temperature!!`,
      };
      client.pushMessage(event.source.groupId, message);
    }

    if (!isTesting && !doneTest) {
      // Keep remind me
      IntervalRemindTest();
      tempIntervalId = setInterval(IntervalRemindTest, remindTime);
    }

    if (isTesting && !doneTest) {
      // Waiting the test result
      message = {
        type: 'text',
        text: `Phish is checking, please wait.`,
      };
      client.pushMessage(event.source.groupId, message);
    }

    if (doneTest) {
      const getData = await axios.get(`${AXIOS_URL_LOCAL}${TEMP_API}`);
      const dataSeconds = new Date(getData.data.data[0].createdAt).getTime();
      const Now = new Date().getTime();
      const diffSec = Now - dataSeconds;
      console.log(`${(resetTime - diffSec) / 1000} seconds left`);
      if (diffSec > resetTime) {
        // Keep remind me
        IntervalRemindTest();
        tempIntervalId = setInterval(IntervalRemindTest, remindTime);
        const resetData = await axios.put(`${AXIOS_URL_LOCAL}${TEMP_API}`, {
          ...getData.data.data[0],
          isTesting: false,
          doneTest: false,
        });
        return;
      }
      if (temp < 38) {
        replyMsg = {
          type: 'text',
          text: `It's ${temp} ℃，No Fever.`,
        };
        return client.replyMessage(event.replyToken, replyMsg);
      } else {
        replyMsg = {
          type: 'text',
          text: `It's ${temp} ℃，Got Fever!!`,
        };
        return client.replyMessage(event.replyToken, replyMsg);
      }
    }
  }

  // keyword ok
  if (event.message.text.toLowerCase().includes('ok')) {
    const echoMsg = event.message.text.toLowerCase().split('ok').join(' ');
    const userId = event.source.userId;
    const userProfile = await client.getProfile(userId);
    const getData = await axios.get(`${AXIOS_URL_LOCAL}${TEMP_API}`);
    const tempDataObject = getData.data.data[0];
    console.log(userProfile);
    if (userProfile.displayName !== 'phish') return;

    // Led
    let ledIntenVal = 0;
    let ledValIsUp = true;
    function colorLedFade() {
      if (ledIntenVal < 100 && ledValIsUp) {
        led.intensity((ledIntenVal += 10));
      } else if (ledIntenVal == 100 && ledValIsUp) {
        ledValIsUp = false;
      } else if (ledIntenVal > 0 && !ledValIsUp) {
        led.intensity((ledIntenVal -= 10));
      } else if (ledIntenVal == 0 && !ledValIsUp) {
        ledValIsUp = true;
      }
    }

    led.stop();
    const testingLedIntervalId = setInterval(colorLedFade, 100);
    clearInterval(tempIntervalId);
    temperature.enable();
    const replyMsg = {
      type: 'text',
      text: `Phish is checking now, please wait for ${
        testingTime / 1000
      } seconds.`,
    };
    // console.log(userProfile);
    try {
      const data = await axios.put(`${AXIOS_URL_LOCAL}${TEMP_API}`, {
        ...tempDataObject,
        isTesting: true,
      });
    } catch (error) {
      console.log('error', error);
      // return client.replyMessage(event.replyToken, error);
    }

    async function resetTestRes() {
      const finalRes = await axios.get(`${AXIOS_URL_LOCAL}${TEMP_API}`);
      const resetVal = finalRes.data.data[0];
      console.log(resetVal);
      const resetData = await axios.put(`${AXIOS_URL_LOCAL}${TEMP_API}`, {
        ...resetVal,
        isTesting: false,
        doneTest: false,
      });
      console.log('reset');
      led.color('#000000');
      led.stop();
    }

    async function finishedTest() {
      console.log(`Finished`);
      const finalRes = await axios.get(`${AXIOS_URL_LOCAL}${TEMP_API}`);
      const { temp } = finalRes.data.data[0];
      const data = await axios.put(`${AXIOS_URL_LOCAL}${TEMP_API}`, {
        ...finalRes.data.data[0],
        isTesting: false,
        doneTest: true,
      });
      temperature.disable();
      setTimeout(resetTestRes, resetTime);
      if (temp < 38) {
        clearInterval(testingLedIntervalId);
        led.stop();
        led.on();
        led.color('#00FF00');
        const finalMsg = {
          type: 'text',
          text: `It's ${temp} ℃，No Fever.`,
        };
        client.pushMessage(event.source.groupId, finalMsg);
      } else {
        clearInterval(testingLedIntervalId);
        led.stop();
        led.on();
        led.color('#FF0000');
        finalMsg = {
          type: 'text',
          text: `It's ${temp} ℃，Got Fever!!`,
        };
        client.pushMessage(event.source.groupId, finalMsg);
      }
    }

    setTimeout(finishedTest, testingTime);
    return client.replyMessage(event.replyToken, replyMsg);
  }

  // keyword lala
  if (event.message.text.toLowerCase().includes('lala')) {
    const echoMsg = event.message.text.toLowerCase().split('lala').join(' ');
    const userId = event.source.userId;
    const userProfile = await client.getProfile(userId);
    const replyMsg = {
      type: 'text',
      text: `echo: ${echoMsg}`,
    };
    console.log(userProfile);
    return client.replyMessage(event.replyToken, replyMsg);
  }
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
