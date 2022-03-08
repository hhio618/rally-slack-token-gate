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
  


module.exports = {httpGet, httpPost}
  