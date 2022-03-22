
const { ErrorCode } = require('@slack/bolt')
const { WebClient } = require('@slack/client')
const db = require('../models')
const { rallyClient } = require('../rally')
const crypto = require('crypto')

const invalidRuleError = new Error('invalid/missing rules')

function getChannelId (txt) {
  return txt !== undefined ? txt.trim().split('#')[1].split('|')[0] : '' // The inputted parameters
}

function isRuleValid (rule, nft = false) {
  parts = rule.split(':')
  if (parts.length == 2) {
    value = parts[1]
    if (!isNaN(value)) {
      isFloat = value.toString().indexOf('.') != -1
      return !(nft && isFloat)
    }
  }
  return false
}

// Validate input rules.
function validateRules (txt, nft = false) {
  // Accept valid characters only.
  if (!/^[a-zA-Z0-9_\.\,\-\:\s#<>|]*$/.test(txt)) {
    throw invalidRuleError
  }
  txt = txt.trim()
  const parts = txt.split(/\s+/g)

  if (parts[0].includes(':')) {
    throw new Error('invalid/missing channel name')
  }
  if (parts.length < 2) {
    throw invalidRuleError
  }

  rules = txt.replace(parts[0], '').trim()
  rules = rules.split(/\s+/).join('')
  console.log(rules)
  for (rule of rules.split(',')) {
    if (!isRuleValid(rule, nft)) {
      throw invalidRuleError
    }
  }
  return { channel: getChannelId(parts[0]), rules: rules }
}

async function addChannel ({ command, client, ack, say }) {
  try {
    await ack()
    let txt
    try {
      txt = getChannelId(command.text)
    } catch (error) {
      console.log(error)
      console.log(txt)
      say(txt + ' is not a valid private channel')
      return
    }

    let result
    try {
      result = await client.conversations.info({ channel: txt })
    } catch (error) {
      // Check the code property, and when its a PlatformError, log the whole response.
      if (error.code === ErrorCode.PlatformError) {
        console.log(error.data)
      } else {
        say(txt + 'channel is not found or bot is not a memeber of it')
      }
      console.log(error.data)
      console.log(txt)
      return
    }
    console.log(result)

    const [channel, created] = await db.Channel.findOrCreate({
      where: { channel_name: result.channel.id },
      defaults: {
        channel_name: result.channel_id,
        nft_rules: '',
        coin_rules: ''
      }
    })
    if (!created) {
      say('channel already exists!')
    } else {
      say('channel added!, please add your desired rules using /set-nft-rules or /set-coin-rules commands.')
    }
  } catch (error) {
    console.log('err')
    console.error(error)
  }
}

async function removeChannel ({ command, ack, say }) {
  try {
    await ack()
    const txt = command.text.trim() // The inputted parameters

    // Check for confirmation.
    const names = txt.split(/\s+/)
    if (names[0] != names[1]) {
      say('Please confirm by typing name twice sperated by space')
      return
    }

    let name
    try {
      name = getChannelId(names[0])
    } catch (error) {
      console.log(error)
      console.log(txt)
      say(names[0] + ' is not a managed private channel')
      return
    }

    const deleted = !!await db.Channel.destroy({
      where: { channel_name: name }
    })
    if (deleted) {
      say('channel deleted!')
    } else {
      say(name + ' is not a managed private channel')
    }
  } catch (error) {
    console.log('err')
    console.error(error)
  }
}

async function listChannels ({ command, client, ack, say }) {
  try {
    await ack()
    const results = await db.Channel.findAll()
    const records = results.map(result => result.dataValues)
    if (records.length === 0){
      say(`Empty channels list, try adding private channels using the /add-channel command.`)
    }
    for (record of records) {
      let result = {channel: {name: "", id: record.channel_name}}
      try {
        result = await client.conversations.info({ channel: record.channel_name })
      } catch (error) {
        // Check the code property, and when its a PlatformError, log the whole response.
        if (error.code === ErrorCode.PlatformError) {
          console.log(error.data)
        } 
        console.log(error)
        console.log(txt)
      }
      say(`Channel name: ${result.channel.name}(#${result.channel.id})\nNFT rules: ${record.nft_rules}\nCreatorCoin rules: ${record.coin_rules}`)
    }
  } catch (error) {
    console.log('err')
    console.error(error)
  }
}

async function clearNFTRules ({ command, ack, say }) {
  let rules
  try {
    await ack()
    let channel_id
    try {
      channel_id = getChannelId(command.text)
    } catch (error) {
      console.log(error)
      say(command.txt + ' is not a valid private channel')
      return
    }

    const channel = await db.Channel.findOne({
      where: { channel_name: channel_id }
    })

    if (channel === null) {
      say('Channel not found!')
      return
    }
    try {
      await db.Channel.update({ nft_rules: "" }, {
        where: {
          channel_name: channel_id
        }
      })
    } catch (error) {
      console.log('err')
      console.error(error)
      say('Unexpected internal error')
      return
    }
    say('Rules cleared!')
  } catch (error) {
    console.log('err')
    console.error(error)
  }
}

async function clearCoinRules ({ command, ack, say }) {
  let rules
  try {
    await ack()
    let channel_id
    try {
      channel_id = getChannelId(command.text)
    } catch (error) {
      console.log(error)
      say(command.txt + ' is not a valid private channel')
      return
    }

    const channel = await db.Channel.findOne({
      where: { channel_name: channel_id }
    })

    if (channel === null) {
      say('Channel not found!')
      return
    }
    try {
      await db.Channel.update({ coin_rules: "" }, {
        where: {
          channel_name: channel_id
        }
      })
    } catch (error) {
      console.log('err')
      console.error(error)
      say('Unexpected internal error')
      return
    }
    say('Rules cleared!')
  } catch (error) {
    console.log('err')
    console.error(error)
  }
}

async function setNFTRules ({ command, ack, say }) {
  let rules
  try {
    await ack()
    const txt = command.text // The inputted parameters
    try {
      rules = validateRules(txt, nft = true)
    } catch (e) {
      console.log('err')
      console.log(e)
      say('Input format: <channel_name> <[nft-address1]:[num-min-requirements1] , [nft-address2]:[num-min-requirements2],...>')
      return
    }

    const channel = await db.Channel.findOne({
      where: { channel_name: rules.channel }
    })

    if (channel === null) {
      say('Channel not found!')
      return
    }
    try {
      await db.Channel.update({ nft_rules: rules.rules }, {
        where: {
          channel_name: rules.channel
        }
      })
    } catch (error) {
      console.log('err')
      console.error(error)
      say('Unexpected internal error')
      return
    }
    say('Rules changed!')
  } catch (error) {
    console.log('err')
    console.error(error)
  }
}

async function setCoinRules ({ command, ack, say }) {
  let rules
  try {
    await ack()
    const txt = command.text // The inputted parameters
    try {
      rules = validateRules(txt, nft = false)
    } catch (e) {
      console.log('err')
      console.log(e)
      say('Input format: <channel_name> <[coin-address1]:[float-min-requirements1] , [coin-address2]:[float-min-requirements2],...>')
      return
    }

    const channel = await db.Channel.findOne({
      where: { channel_name: rules.channel }
    })

    if (channel === null) {
      say('Channel not found!')
      return
    }
    try {
      await db.Channel.update({ coin_rules: rules.rules }, {
        where: {
          channel_name: rules.channel
        }
      })
    } catch (error) {
      console.log('err')
      console.error(error)
      say('Unexpected internal error')
      return
    }
    say('Rules changed!')
  } catch (error) {
    console.log('err')
    console.error(error)
  }
}

async function requestPrivateChannel ({ command, client, ack, say }) {
  try {
    await ack()
    const txt = command.text // The inputted parameters
    let channel_id
    try {
      console.log("###################")
      console.log(txt)
      console.log("###################")
      const result = await client.conversations.info({ channel: txt })
      channel_id = result.channel.id
    } catch (error) {
      // Check the code property, and when its a PlatformError, log the whole response.
      if (error.code === ErrorCode.PlatformError) {
        console.log(error.data)
      } else {
        say(txt + 'channel is not found or bot is not a memeber of it')
      }
      console.log(error)
      console.log(txt)
      return
    }
    
    const channel = await db.Channel.findOne({
      where: { channel_name: channel_id }
    })

    if (channel === null) {
      say('Channel not found!')
      return
    }

    // Create user if not exists.
    const [user, created] = await db.User.findOrCreate({
      where: { slack_id: command.user_id },
      defaults: {
        slack_id: command.user_id
      }
    })

    if (!created) {
      console.log('user already exists, skip on creation...')
    }

    // Random state string.
    const state = crypto.randomBytes(10).toString('hex')

    // TODO: handle group left event.
    // Destroy the Rally challenge.
    await db.RallyChallenge.destroy({ where: { user_id: user.id, channel_id: channel.id } })
    await db.RallyChallenge.create({
      user_id: user.id,
      channel_id: channel.id,
      settled: false,
      rally_state: state,
      required_rules: `${channel.coin_rules}|${channel.nft_rules}`
    })

    try {
      const data = await rallyClient.requestAuthorization(state)
      say(`Please follow this link to fulfill the challenge using your Rally account: \n${data.url}`)
    } catch (err) {
      console.log(`while requesting rally authorize url: ${err}`)
      say('Error while requesting a Rally authorization, please try again later')
    }
  } catch (error) {
    say('Unexpected internal error!')
    console.log('err')
    console.error(error)
  }
}

module.exports = { validateRules, addChannel, removeChannel, listChannels, setNFTRules, setCoinRules, clearCoinRules, clearNFTRules, requestPrivateChannel }
