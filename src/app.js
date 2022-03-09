'use strict'
const schedule = require('node-schedule')
const { register } = require('./rally/tasks')
// Loading the .env file if exists.
require('dotenv').config()
const { bot } = require('./bot')
const { db } = require('./models')

// Running the app after the database initialization.
const port = process.env.PORT || 5000

// Registring the rally App.
register().then((data) => {
  const renewalPeriod = parseInt(data.expires_in / 60 * 0.9)
  console.log(`Initial Rally app registration done!\naccess_token will expires in ${data.expires_in}, renewal in ${renewalPeriod} minutes!`)
  schedule.scheduleJob(`*/${renewalPeriod} * * * *`, async function () { // Execute every 50 minutes.
    console.log('Trying to renew the Rally credentials...')
    register().then(() => console.log('Rally token renewed!'))
      .catch(e => console.log(`Rally token renewal error: ${e}`))
  })
}).catch(e => {
  console.log(`Initial Rally app registration error: ${e}`)
  process.exit(1)
})

bot.start(port,
  () => console.log(`App listening on port ${port}!`)
)
