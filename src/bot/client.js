const { WebClient } = require('@slack/web-api')

const slackBotClient = new WebClient(process.env.SLACK_BOT_TOKEN)
module.exports = slackBotClient
