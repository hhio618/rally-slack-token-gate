const schedule = require('node-schedule');
const axios = require('axios').default;
const { rallyClient } = require('.');

function toConfig(headers, params) {
    let config = {};
    if(headers && Object.keys(headers).length ){
      config.headers = headers;
    }
    if(params && Object.keys(params).length ){
      config.params = params;
    }
    return config;
  }
  
  async function httpPost(url, body, headers) {
      try {
        console.log(`Using body: ${body}, headers: ${toConfig(headers)}`)
        return await axios.post(url, body, toConfig(headers));
      } catch (err) {
        return err.response;
      }
  }
  
  async function httpGet(url, headers, params) {
      try {
        return await axios.get(url, toConfig(headers, params));
      } catch (err) {
        return err.response;
      }
  }
  
async function register() {
    console.log(`Trying to register to Rally, username: ${rallyClient.username}, password: ${rallyClient.password} `);
    const username = rallyClient.username;
    const password = rallyClient.password;
    const response = await httpPost(rallyClient.rally_v1_url + "/oauth/register", {username, password});
    const status = response.status;
    console.log(`status = ${status}`);
    const data = response.data;
    console.log(`data = ${JSON.stringify(data,undefined,2)}`);
    let renewDate;
    if (status == 200) {
        rallyClient.setAuthentication(data);
        renewDate = (data.expires_in || 3600) * 1000 + Date.now()  - 300 * 1000; // Renew 5 min before the expiration.
    } else {
        rallyClient.setAuthentication();
        console.log("error while registering Rally App")
        renewDate = Date.now() +  60 * 1000; // Retrying in a minute!
    }
    schedule.scheduleJob(renewDate, function(){
        console.log(`Trying to renew the Rally credentials, username: ${rallyClient.username}, password: ${rallyClient.password} `);
        register();
    });
}

module.exports = {register, httpGet, httpPost}
  