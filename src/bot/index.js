const { App } = require("@slack/bolt")
const {addChannel, removeChannel, listChannels, setNFTRules,
   setCoinRules, requestPrivateChannel} = require("./commands")
const {callback} = require("../rally")
const slackUserClient = require("./client")
const listenChannelRemoveEvent = require("./events")


// Slack bot app.
const bot = new App({
    token: process.env.SLACK_BOT_TOKEN, //Find in the Oauth  & Permissions tab
    signingSecret: process.env.SIGNING_SECRET, // Find in Basic Information Tab
    socketMode:true,
    appToken: process.env.SOCKET_TOKEN, // Token from the App-level Token that we created
    port: process.env.PORT,
    customRoutes: [
      {
        path: "/callback",
        method: ['GET'],
        handler: callback,
      },
    ],
});


// Admin authorization middleware.
async function adminOnly({ payload, client, context, next }) {
  // const {result} = await slackUserClient.admin.users.list({team: payload.team_id});
  // console.log(result)
  // const admins = result.users.filter(user => !user.is_bot).map(user => user.id);
  const slackUserId = payload.user_id;
  console.log(`Processing request for the slack user: ${slackUserId}`);
  // if (admins.includes(slackUserId)) {
  if (slackUserId !== process.env.SLACK_ADMIN_USER) {
        await client.chat.postEphemeral({
          channel: payload.channel_id,
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
bot.command("/set-nft-rules", adminOnly, setNFTRules)
bot.command("/set-coin-rules", adminOnly, setCoinRules)

// Listening to the required events.
bot.event('channel_deleted', listenChannelRemoveEvent)


module.exports = { bot, slackUserClient }