const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');
const app = express();

app.get('/', (req, res) => res.send('online'));
app.post('/dialogflow', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  function welcome() {
    agent.add('Welcome to my agent!');
  }

  let intentMap = new Map();
  intentMap.set('queryBodyTemp', welcome);
  agent.handleRequest(intentMap);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
