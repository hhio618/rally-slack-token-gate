const axios = require('axios').default;
const crypto = require("crypto");

function toConfig(headers) {
    return headers && Object.keys(headers).length ? { headers } : undefined;
}

async function httpPost(url, body, headers) {
    try {
      return await axios.post(url, body, toConfig(headers));
    } catch (err) {
      return err.response;
    }
}

async function httpGet(url, headers) {
    try {
      return await axios.get(url, toConfig(headers));
    } catch (err) {
      return err.response;
    }
}

class RallyClient {
    access_token = undefined;
    refresh_token = undefined;
    expires = undefined;
    token_type = undefined;

    constructor(username, password, data_api_base_url, rally_v1_url, rally_api_url, callback_url) {
        this.username = username
        this.password = password
        this.data_api_base_url = data_api_base_url
        this.rally_v1_url = rally_v1_url
        this.rally_api_url = rally_api_url
        this.callback_path = new URL(callback_url).pathname;
    }

    setAuthentication(data) {
        if (data) {
          this.access_token = data.access_token;
          this.expires = (data.expires_in || 3600) * 1000 + Date.now();
          this.refresh_token = data.refresh_token || refresh_token;
          this.token_type = data.token_type;
        } else {
          this.access_token = undefined;
          this.expires = undefined;
          this.refresh_token = undefined;
          this.token_type = undefined;
        }
    }

    async register() {
        console.log(`Trying to register to Rally, username: ${this.username}, password: ${this.password}`);
        const response = await httpPost(this.rally_v1_url + "/oauth/register", {"username": this.username, "password": this.password});
        const status = response.status;
        console.log(`status = ${status}`);
        const data = response.data;
        console.log(`data = ${JSON.stringify(data,undefined,2)}`);
        if (status == 200) {
          this.setAuthentication(data);
          return true
        } else {
          this.setAuthentication();
          throw new Error('Registration failed: clearing authentication data');
        }
    }

    async requestAuthorization(){
        console.log("/authorize");
        if (!this.access_token) {
            // TODO: renew the access token.
            throw new Error("Application Not Registered With Rally")
        }
        const state = crypto.randomBytes(10).toString('hex');
        console.log(`Calling Rally IO authorize API: state = ${state}, callback = ${callback_url}`);
        const rally_response = await httpPost(
          rally_v1_url + "/oauth/authorize",
          { callback: callback_url, state: state },
          { Authorization: "Bearer " + this.access_token }
        );
  
        console.log(`rally_response = ${JSON.stringify(rally_response.data)}`);
        const status = rally_response.status;
        if (status == 200) {
          return {url: rally_response.data.url, state: state}
        } else {
          throw new Error('Request authorization failed');
        }
      }

    async callback(request, h) {
        console.log(callback_path);
        if (!access_token) {
          return h.response("Application Not Registered With Rally").code(401);
        }
        console.log(`params = ${JSON.stringify(request.query)}`);
        const code = request.query.code;
        const state = request.query.state;
        console.log(`code = ${code}, state = ${state}`);
        if (code === "cancelled") {
          return h.response("No authorization to continue").code(200);
        }
        const rally_response = await httpPost(
          rally_v1_url + "/oauth/userinfo",
          { code },
          { Authorization: "Bearer " + access_token }
        );
        const status = rally_response.status;
        if (status == 200) {
          return h.response(rally_response.data).code(200);
        } else {
          return h.response(rally_response.statusText).code(status);
        }
      }

    async userinfo(userId) {
          if (!this.access_token) {
            // TODO: renew the access token.
            throw new Error("Application Not Registered With Rally")
          }
          console.log(`userId = ${userId}`);
          console.log("Calling Rally IO userinfo API");
          const rally_response = await httpGet(
            `${this.rally_v1_url}/users/rally/${userId}/userinfo`,
            { Authorization: "Bearer " + this.access_token }
          );
    
          console.log(`rally_response = ${JSON.stringify(rally_response.data)}`);
          return rally_response.data
        }

}


module.exports = {
    RallyClient: RallyClient
}