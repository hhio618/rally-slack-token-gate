const axios = require('axios').default;
var isAbsoluteURL = require('axios/lib/helpers/isAbsoluteURL')
var buildURL = require('axios/lib/helpers/buildURL')
var combineURLs = require('axios/lib/helpers/combineURLs')
var URL_KEY = '__AXIOS-DEBUG-LOG_URL__'

function getURL (config) {
  var url = config.url
  if (config.baseURL && !isAbsoluteURL(url)) {
    url = combineURLs(config.baseURL, url)
  }
  return buildURL(url, config.params, config.paramsSerializer)
}

require('axios-debug-log')({
  request: function (debug, config) {
    var url = getURL(config)
    Object.defineProperty(config, URL_KEY, { value: url })
    debug(
      '\n==============================================================>\n'+
      config.method.toUpperCase() + ' ' + url + '\ndata: \n' + simpleStringify(config.data)
      + '\nheaders: \n' + simpleStringify(config.headers) +
      '\n==============================================================>\n'
    )
  },
  response: function (debug, response) {
    var url = response.config[URL_KEY]
    debug(
      '\n<==============================================================\n' +
      response.status + ' ' + response.statusText,
      '(' + response.config.method.toUpperCase() + ' ' + url + ')' +
      '\n<==============================================================\n' 
    )
  }
})
require('axios-debug-log/enable');


const defaultConfig = {headers: {"Content-Type" :"application/json"}}
function toConfig(headers, params) {
    let config = defaultConfig;
    if(headers && Object.keys(headers).length ){
      config.headers = Object.assign(config.headers, headers);
    }
    if(params && Object.keys(params).length ){
      config.params = params;
    }
    return config
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
  