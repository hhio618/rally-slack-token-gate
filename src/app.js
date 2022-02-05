'use strict';

// Loading the .env file if exists.
require('dotenv').config();
const { App } = require("@slack/bolt");
const { WebClient } = require("@slack/client");
const { RallyClient } = require("./clients/rally.js");

// Reading the Rally client params from environment variables.
const data_api_base_url = process.env.RALLY_API_URL || "https://api.rally.io";
const rally_v1_url =  `${data_api_base_url}/v1`;
const rally_api_url = `${data_api_base_url}/api`;
const username = process.env.RALLY_IO_USERNAME;
const password = process.env.RALLY_IO_PASSWORD;
const callback_url = process.env.RALLY_APP_CALLBACK;

const rallyClient = new RallyClient(username, password, data_api_base_url,rally_api_url, rally_v1_url, callback_url)

const app = new App({
    token: process.env.SLACK_TOKEN, //Find in the Oauth  & Permissions tab
    signingSecret: process.env.SIGNING_SECRET, // Find in Basic Information Tab
    socketMode:true,
    appToken: process.env.SOCKET_TOKEN, // Token from the App-level Token that we created
    port: process.env.PORT,
    customRoutes: [
      {
        path: rallyClient.callback_path,
        method: ['POST'],
        handler: (req, res) => {
          res.write("hello world!")
        },
      },
    ],
});

const bot = new WebClient(process.env.SLACK_TOKEN)
app.command("/request-private-channel", async ({ command, ack, say }) => {
    try {
      await ack();
      let txt = command.text // The inputted parameters
      if(isNaN(txt)) {
          say(txt + " is not a number")
      } else {
          say(txt + " squared = " + (parseFloat(txt) * parseFloat(txt)))
      }
      if (txt == "plz") {
        bot.conversations.invite({channel: "C02S2790C2E", users: command.user_id})
      }
    } catch (error) {
      console.log("err")
      console.error(error);
    }
});


app.message("hello", async ({ command, say }) => { // Replace hello with the message
    try {
      say("Hi! Thanks for PM'ing me!");
    } catch (error) {
        console.log("err")
      console.error(error);
    }
});

app.event("message", async ({ command, message, event, say }) => { // Replace hello with the message
    try {
      say("Hi! Thanks for eventing me!" + event);
    } catch (error) {
        console.log("err")
      console.error(error);
    }
}

)


app.start(process.env.PORT || 5000)