const { RallyClient } = require("./rally");

// Reading the Rally client params from environment variables.
const data_api_base_url = process.env.RALLY_API_URL || "https://api.rally.io";
const rally_v1_url =  `${data_api_base_url}/v1`;
const rally_api_url = `${data_api_base_url}/api`;
const username = process.env.RALLY_IO_USERNAME;
const password = process.env.RALLY_IO_PASSWORD;
const callback_url = process.env.RALLY_APP_CALLBACK;

// API client for interacting with the Rally API.
const rallyClient = new RallyClient(username, password, data_api_base_url,rally_api_url, rally_v1_url, callback_url)

module.exports = { rallyClient }