const { config } = require('dotenv');
const schedule = require('node-schedule');
const axios = require('axios').default;
const { rallyClient } = require('.');

axios.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2))
  return request
})


axios.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response, null, 2))
  return response
})

const defaultConfig = {headers: {"Content-Type" :"application/json"}}
function toConfig(headers, params) {
    let config = {};
    if(headers && Object.keys(headers).length ){
      config.headers = headers;
    }
    if(params && Object.keys(params).length ){
      config.params = params;
    }
    console.log(`############ Start`)
    console.log(`############ ${JSON.stringify(Object.assign(config, defaultConfig))}`)
    return Object.assign(config, defaultConfig);
  }
  
  async function httpPost(url, body, headers) {
      try {
        const head = toConfig(headers)
        console.log(`headers: ${json.stringify(head)}`)
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
  