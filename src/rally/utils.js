const axios = require('axios').default;

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
    return Object.assign(config, defaultConfig);
  }
  
  async function httpPost(url, body, headers) {
      try {
        return await axios.post(url, body, toConfig(headers));
      } catch (err) {
        console.log(`error while doing http post: err: ${err} response: ${JSON.stringify(err.response)}`);
        return err.response;
      }
  }
  
  async function httpGet(url, headers, params) {
      try {
        return await axios.get(url, toConfig(headers, params));
      } catch (err) {
        console.log(`error while doing http get: err: ${err} response: ${JSON.stringify(err.response)}`);
        return err.response;
      }
  }
  
  function simpleStringify (object){
    var simpleObject = {};
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) == 'object'){
            continue;
        }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
};

module.exports = {httpGet, httpPost, simpleStringify}
  