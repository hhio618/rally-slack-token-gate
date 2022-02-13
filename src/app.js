'use strict';

// Loading the .env file if exists.
require('dotenv').config();
const { bot } = require("./bot");
const { createClient } = require('redis');
const { db } = require("./models");


// Initializing the redis database.
(async () => {
  const client = createClient();

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();

  await client.set('key', 'value');
  const value = await client.get('key');
})();

// Running the app after the database initialization.
const port = process.env.PORT || 5000
bot.start(port, 
() => console.log(`App listening on port ${port}!`)
)