const { WebClient } = require("@slack/web-api")

const slackUserClient = new WebClient(process.env.SLACK_USER_TOKEN)
module.exports = slackUserClient