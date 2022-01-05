const { App } = require("@slack/bolt");


const app = new App({
    token: process.env.SLACK_TOKEN, //Find in the Oauth  & Permissions tab
    signingSecret: process.env.SIGNING_SECRET, // Find in Basic Information Tab
    socketMode:true,
    appToken: process.env.SOCKET_TOKEN // Token from the App-level Token that we created
});

app.command("/square", async ({ command, ack, say }) => {
    try {
      await ack();
      let txt = command.text // The inputted parameters
      if(isNaN(txt)) {
          say(txt + " is not a number")
      } else {
          say(txt + " squared = " + (parseFloat(txt) * parseFloat(txt)))
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

app.start(3000)