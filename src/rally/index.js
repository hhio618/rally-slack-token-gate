const { RallyClient } = require("./rally");
const {parseRules} = require("../bot/utils")
const slackUserClient = require("../bot/client")
const db  = require("../models")



// Reading the Rally client params from environment variables.
const data_api_base_url = process.env.RALLY_API_URL || "https://api.rally.io";
const rally_v1_url =  `${data_api_base_url}/v1`;
const rally_api_url = `${data_api_base_url}/api`;
const username = process.env.RALLY_IO_USERNAME;
const password = process.env.RALLY_IO_PASSWORD;
const callback_url = process.env.RALLY_APP_CALLBACK;

// API client for interacting with the Rally API.
const rallyClient = new RallyClient(username, password, data_api_base_url,rally_v1_url, rally_api_url, callback_url)

async function callback(req, res){
        const query = url.parse(req.url, true).query;
        console.log(`params = ${JSON.stringify(query)}`);
        const code = query.code;
        const state = query.state;
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
          console.log(`Unexpected error while parsing challenge rules: ${challenge.required_rules} , ${e}`)
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
                res.writeHead(200)
                res.end("You've been added to the requested channel!")
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
      
}

module.exports = { rallyClient, callback }