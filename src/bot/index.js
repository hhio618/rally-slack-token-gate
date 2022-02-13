const { App } = require("@slack/bolt")
const {addChannel, removeChannel, listChannels, setNFTrules,
   setCoinRules, requestPrivateChannel} = require("./commands")
const listenChannelRemoveEvent = require("./events")


const SLACK_ADMIN_USER = process.env.SLACK_ADMIN_USER;
// Slack bot app.
const bot = new App({
    token: process.env.SLACK_TOKEN, //Find in the Oauth  & Permissions tab
    signingSecret: process.env.SIGNING_SECRET, // Find in Basic Information Tab
    socketMode:true,
    appToken: process.env.SOCKET_TOKEN, // Token from the App-level Token that we created
    port: process.env.PORT,
    customRoutes: [
      {
        path: "/register",
        method: ['GET'],
        handler: (req, res) => {
          rallyClient.register()
            .then(registered =>{
              res.writeHead(200)
              res.end("Registered")
            })
            .catch(err => {
              console.log(`while registering rally app: ${err}`);
              res.writeHead(503)
              res.end("Service unavailable")
            })

        },
      },
    ],
});

// Admin authorization middleware.
async function adminOnly({ payload, client, context, next }) {
  const slackUserId = payload.user;
  if (slackUserId != SLACK_ADMIN_USER) {
        await client.chat.postEphemeral({
          channel: payload.channel,
          user: slackUserId,
          text: `Sorry <@${slackUserId}>, you aren't authorized to do such admin tasks.`
        });
        return
  }
  
  await next();
}

// Route the slash commands.
bot.command("/add-channel", adminOnly, addChannel)
bot.command("/remove-channel", adminOnly, removeChannel)
bot.command("/list-channels", adminOnly, listChannels)
bot.command("/set-nft-rules", adminOnly, setNFTrules)
bot.command("/set-coin-rules", adminOnly, setCoinRules)

// Listening to the required events.
bot.event('channel_deleted', listenChannelRemoveEvent)


module.exports = { bot }