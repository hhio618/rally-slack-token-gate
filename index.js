const { App } = require("@slack/bolt");
const { WebClient } = require("@slack/client");

const app = new App({
    token: process.env.SLACK_TOKEN, //Find in the Oauth  & Permissions tab
    signingSecret: process.env.SIGNING_SECRET, // Find in Basic Information Tab
    socketMode:true,
    appToken: process.env.SOCKET_TOKEN // Token from the App-level Token that we created
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

app.start(process.env.PORT)