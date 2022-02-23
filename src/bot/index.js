const { App } = require("@slack/bolt")
const { WebClient } = require("@slack/web-api")
const {addChannel, removeChannel, listChannels, setNFTRules,
   setCoinRules, requestPrivateChannel} = require("./commands")
const {rallyClient} = require("../rally")
const listenChannelRemoveEvent = require("./events")
const {parseRules} = require("./utils")


// const SLACK_ADMIN_USER = process.env.SLACK_ADMIN_USER;
const slackUserClient = new WebClient(process.env.SLACK_USER_TOKEN)
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
        handler: async (req, res) => {
          console.log(`params = ${JSON.stringify(req.query)}`);
          const code = request.query.code;
          const state = request.query.state;
          console.log(`code = ${code}, state = ${state}`);
          if (code === "cancelled") {
            res.writeHead(503)
            res.end("Rally authorization cancelled!")
            return;
          }

          const challenge = await db.RallyChallenge.findOne({
            where: { state: state },
          });

          const channel = await db.Channel.findOne({
            where: { id: challenge.channel_id },
          });

          const user = await db.User.findOne({
            where: { id: challenge.user_id },
          });

          if (challenge === null || channel === null || user === null){
            res.writeHead(404)
            res.end("Challenge and/or requested channel not found!")
            return;
          }
          let rules;
          try{
            rules = parseRules(challenge.required_rules)
          }catch(e){
            console.log("err");
            console.log(`Unexpected error while parsing challenge rules: ${challenge.required_rules}`)
            res.writeHead(503)
            res.end("Unexpected internal error!")
            return;
          }
          try{
              const rallyNetworkWalletId = await rallyClient.requestRallyAccountId(code)
              // Request for balances, etc.
              try{
                for (const id in rules.coin_rules) {
                  required = rules.coin_rules[id]
                  const actual = await rallyClient.balance(rallyNetworkWalletId, id)
                  if (actual < required){
                    res.writeHead(200)
                    res.end(`Minimum CreatorCoin amount for ${id}, required amount: ${required}, user amount: ${actual} `)
                    return;
                  }
                }
                for (const id in rules.nft_rules)  {
                  required = rules.nft_rules[id]
                  const actual = await rallyClient.nft(rallyNetworkWalletId, id)
                  if (actual < required){
                    res.writeHead(200)
                    res.end(`Minimum CreatorCoin NFT for ${id}, #required: ${required}, #user amount: ${actual} `)
                    return;
                  }
                }

                try {
                  await db.RallyChallenge.update({ settled: true, rally_account_id: rallyNetworkWalletId }, {
                    where: { state: state },
                  });
                  // Joining the user here.
                  await slackUserClient.conversations.invite({channel: channel.channel_name, user: user.slack_id})

                } catch(error){
                  console.log("err")
                  console.error(error);
                  say(`Unexpected internal error`)
                  return;
                }
              }catch(e){
                console.log("err");
                console.log(`Unexpected error while parsing challenge rules: ${challenge.required_rules}`)
                res.writeHead(503)
                res.end("Unexpected internal error!")
                return;
              }
            }catch(err) {
              console.log(`while requestung Rally account info: ${err}`);
              res.writeHead(503)
              res.end("Internal server error")
            }
        },
      },
    ],
});


// Admin authorization middleware.
async function adminOnly({ payload, client, context, next }) {
  console.log(payload)
  const result = slackUserClient.admins.user.list({team: payload.team_id});
  const admins = result.users.filter(user => !user.is_bot).map(user => user.id);
  const slackUserId = payload.user_id;
  console.log(`Processing request for the slack user: ${slackUserId}`);
  if (admins.includes(slackUserId)) {
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