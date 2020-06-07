# Line Bot

This is a automatic and monitoring chatbot system designed for myself during self-quarantine for COVID-19 which I have to report my body temperature to health department frequently.

The chatbot is based on mobile app [Line](https://line.me/ 'Line') since that's the most popular one in Taiwan.

## ngrok running locally

```shell
ngrok http 8080
```

Usually ngrok is a very handy tool allow developer test your code without deployment.
However, in this case, the thermometer sensor and light are all wired within local network, that's the reason why it doesn't deploy to remote server in the end.

## Deploy (test version)

```shell
https://line-bot-8421.herokuapp.com/
```

I still have heroku server depolyment but just for test purpose.

## Usage

---

- Make sure you have developers account from [LineDev](developers.line.biz 'LineDev').
- Get your `channelId`, `channelAccessToken` and `channelSecret`.
- Use webhook and run the ngrok to get your temp link and paste into Webhook URL.
