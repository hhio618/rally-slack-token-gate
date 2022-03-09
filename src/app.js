'use strict';
const schedule = require('node-schedule');
const {register} = require("./rally/tasks")
// Loading the .env file if exists.
require('dotenv').config();
const { bot } = require("./bot");
const { db } = require("./models");

// Running the app after the database initialization.
const port = process.env.PORT || 5000


// Registring the rally App.
schedule.scheduleJob("*/50 * * * *",async function(){ // Execute every 50 minutes.
  console.log(`Trying to renew the Rally credentials, username: ${rallyClient.username}, password: ${rallyClient.password} `);
  register().then(()=>console.log(`Rally token renewed!`)).
  catch(e=>console.log(`Rally token renewal error: ${e}`))
});


bot.start(port, 
() => console.log(`App listening on port ${port}!`)
)