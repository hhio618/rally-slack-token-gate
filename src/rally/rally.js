const {httpGet, httpPost} = require("./utils")


const ErrNotRegistered = new Error("Application Not Registered With Rally");
const ErrFailedAuthorization = new Error("Request authorization failed");


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
        this.callback_url = callback_url
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

    async requestAuthorization(state){
        console.log("/authorize");
        if (!this.access_token) {
            throw ErrNotRegistered
        }
        console.log(`Calling Rally IO authorize API: state = ${state}, callback = ${this.callback_url}`);
        const rally_response = await httpPost(
          rally_v1_url + "/oauth/authorize",
          { callback: this.callback_url, state: state },
          { Authorization: "Bearer " + this.access_token }
        );
  
        console.log(`rally_response = ${JSON.stringify(rally_response.data)}`);
        const status = rally_response.status;
        if (status == 200) {
          return {url: rally_response.data.url, state: state}
        } else {
          throw ErrFailedAuthorization;
        }
    }

    async requestRallyAccountId(code) {
        console.log(callback_path);
        if (!this.access_token) {
          throw ErrNotRegistered;
        }
        const rally_response = await httpPost(
          rally_v1_url + "/oauth/userinfo",
          { code },
          { Authorization: "Bearer " + access_token }
        );
        
        const status = rally_response.status;
        if (status == 200) {
          return rally_response.data.rnbUserId
        } else {
          throw new Error("Rally initial account info request failed")
        }
      }

    async userinfo(userId) {
          if (!this.access_token) {
            throw ErrNotRegistered
          }
          console.log(`userId = ${userId}`);
          console.log("Calling Rally IO userinfo API");
          const rally_response = await httpGet(
            `${this.rally_v1_url}/users/rally/${userId}/userinfo`,
            { Authorization: "Bearer " + this.access_token }
          );
    
          console.log(`rally_response = ${JSON.stringify(rally_response.data)}`);
          const status = rally_response.status;
          if (status == 200) {
            return rally_response.data
          } else {
            throw new Error("Rally initial account info request failed")
          }
    }

    async balance(rallyNetworkWalletId, symbolSearch) {
      if (!this.access_token) {
        throw ErrNotRegistered
      }
      console.log(`rallyNetworkWalletId = ${userallyNetworkWalletIdrId}`);
      console.log("Calling Rally IO Balance API");
      const rally_response = await httpGet(
        `${this.rally_api_url}/rally-network-wallets/${rallyNetworkWalletId}/balance`,
        { Authorization: "Bearer " + this.access_token }, {symbolSearch}
      );

      console.log(`rally_response = ${JSON.stringify(rally_response.data)}`);
      const status = rally_response.status;
      if (status == 200) {
        const data = rally_response.data[0];
        return data? data.amount: 0;
      } else {
        throw new Error("Rally balance req failed")
      }

    }

    async nft(rallyNetworkWalletId, nftTemplateId) {
      if (!this.access_token) {
        throw ErrNotRegistered
      }
      console.log(`rallyNetworkWalletId = ${userallyNetworkWalletIdrId}`);
      console.log("Calling Rally IO Balance API");
      const rally_response = await httpGet(
        `${this.rally_api_url}/nfts`,
        { Authorization: "Bearer " + this.access_token }, {rallyNetworkWalletId, nftTemplateId}
      );

      console.log(`rally_response = ${JSON.stringify(rally_response.data)}`);
      const status = rally_response.status;
      if (status == 200) {
        return rally_response.data.length
      } else {
        throw new Error("Rally nft req failed")
      }
    }

}

module.exports = { RallyClient }