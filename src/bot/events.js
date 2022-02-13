
const { App } = require("@slack/bolt")
const { WebClient } = require("@slack/client")
const { db } = require("../models")


async function listenChannelRemoveEvent({ event, client, logger })  {
    try {
    await db.Channel.destroy({
        where: { channelName: event.channel.id },
      });
    }
    catch (error) {
    logger.error(error);
    }
}


module.exports = { listenChannelRemoveEvent }