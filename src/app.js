'use strict';

// Loading the .env file if exists.
require('dotenv').config();
const { bot } = require("./bot");
const { createClient } = require('redis');
const { db } = require("./models");

// Running the app after the database initialization.
const port = process.env.PORT || 5000
bot.start(port, 
() => console.log(`App listening on port ${port}!`)
)