
const { ErrorCode } = require("@slack/bolt")
const { WebClient } = require("@slack/client")
const { db } = require("../models")
const { rallyClient } = require("../rally")

// Bot client for performing admin tasks.
const botClient = new WebClient(process.env.SLACK_TOKEN)


var invalidRuleError = new Error("invalid/missing rules");

function isRuleValid(rule, nft=false){
  parts = rule.split(':')
  if (parts.length == 2){
    value = parts[1]
    if (!isNaN(value)){
      isFloat = value.toString().indexOf('.') != -1
      return !(nft && isFloat);
    }
  }
  return false
}

// Validate input rules.
function validateRules(txt, nft=false){
  // Accept valid characters only.
  if (! /^[a-zA-Z0-9_\.\,\-\:\s]*$/.test(txt)){
    throw invalidRuleError
  }
  txt = txt.trim()
  const parts = txt.split(/\s+/g);

  if (parts[0].includes(':')){
    throw new Error("invalid/missing channel name")
  }
  if(parts.length < 2 ){
    throw invalidRuleError
  }

  rules = txt.replace(parts[0], "").trim()
  rules = rules.split(/\s+/).join('')
  console.log(rules)
  for (rule of rules.split(',')){
    if (!isRuleValid(rule, nft)){
        throw invalidRuleError
    }
  }
  return {channel: parts[0], rules: rules}
}

async function addChannel ({ command, ack, say }) {
    try {
      await ack();
      let txt = command.text // The inputted parameters
      
      try{
        const result = await botClient.conversations.info({channel: txt});
      } catch (error) {
        // Check the code property, and when its a PlatformError, log the whole response.
        if (error.code === ErrorCode.PlatformError) {
          console.log(error.data);
        } else {
          say(txt + " is not a valid channel")
        }
        return;
      }

      const [channel, created] = await db.Channel.findOrCreate({
        where: { channel_name: result.channel_id },
        defaults: {
          channel_name: result.channel_id,
          nft_rules: "",
          coin_rules: "",
        }
      });
      if (!created){
        say("channel already exists!")
      }

    } catch (error) {
      console.log("err")
      console.error(error);
    }
}

async function removeChannel ({ command, ack, say })  {
    try{
      await ack();
      let txt = command.text.trim() // The inputted parameters

      // Check for confirmation.
      const names = txt.split(/\s+/)
      if (names[0] != names[1]){
        say("Please confirm by typing name twice sperated by space")
        return;
      }
      const channel_name = names[0]
      const deleted =!! await db.Channel.destroy({
        where: { channel_name: channel_name },
      });
      if (deleted){
        say("channel deleted!")
      }else{
        say(channel_name + " is not a valid channel")
      }
    } catch (error) {
      console.log("err")
      console.error(error);
    }
}


async function listChannels ({ command, ack, say })  {
    try {
      await ack();
      const results = await db.Channel.findAll();
      const records = results.map(result => result.dataValues);
      for (record of records){
          say(`Channel name: ${record.channel_name}\nNFT rules: ${record.nft_rules}\nCreatorCoin rules: ${record.coin_rules}`);
      }
    } catch (error) {
      console.log("err")
      console.error(error);
    }
  }


async function setNFTRules ({ command, ack, say })  {
    try {
      await ack();
      let txt = command.text // The inputted parameters
      try{
        channel_name, rules = validateRules(txt, nft=true)
      } catch (e){
        say(`Not a valid nft rules arguments, reason: ${e.message}`)
      }

      const channel = await db.Channel.findOne({
        where: { channel_name: channel_name },
      });

      if (channel === null) {
        say("Channel not found!")
        return
      }
      try {
      await db.Channel.update({ nft_rules: rules }, {
        where: {
          channel_name: channel_name
        }
      });
      } catch(error){
        console.log("err")
        console.error(error);
        say(`Unexpected internal error`)
        return;
      }
    } catch (error) {
      console.log("err")
      console.error(error);
    }
}

async function setCoinRules ({ command, ack, say })  {
  try {
    await ack();
    let txt = command.text // The inputted parameters
    try{
      channel_name, rules = validateRules(txt)
    } catch (e){
      say(`Not a valid nft rules arguments, reason: ${e.message}`)
    }

    const channel = await db.Channel.findOne({
      where: { channel_name: channel_name },
    });

    if (channel === null) {
      say("Channel not found!")
      return
    }
    try {
    await db.Channel.update({ coin_rules: rules }, {
      where: {
        channel_name: channel_name
      }
    });
    } catch(error){
      console.log("err")
      console.error(error);
      say(`Unexpected internal error`)
      return;
    }
  } catch (error) {
    console.log("err")
    console.error(error);
  }
}

async function requestPrivateChannel ({ command, ack, say }) {
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
  }



module.exports = {validateRules, addChannel, removeChannel, listChannels, setNFTRules, setCoinRules, requestPrivateChannel};
