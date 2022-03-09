const axios = require('axios').default;
require('axios-debug-log')({
  request: function (debug, config) {
    debug('Request with ' + config.headers)
  },
  response: function (debug, response) {
    debug(
      'Response with ' + response.headers,
      'from ' + response.config.url
    )
  }
})
require('axios-debug-log/enable');


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
        console.log(`error while doing http post: err: ${err} response: ${simpleStringify(err.response)}`);
        return err.response;
      }
  }
  
  async function httpGet(url, headers, params) {
      try {
        return await axios.get(url, toConfig(headers, params));
      } catch (err) {
        console.log(`error while doing http get: err: ${err} response: ${simpleStringify(err.response)}`);
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
  