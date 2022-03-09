
const { rallyClient } = require('.');
const {httpPost, simpleStringify} = require("./utils");

async function register() {
    const username = rallyClient.username;
    const password = rallyClient.password;
    const response = await httpPost(rallyClient.rally_v1_url + "/oauth/register", {username, password});
    console.log(`###### Response = ${simpleStringify(response)}`);
    const status = response.status;
    console.log(`status = ${status}`);
    const data = response.data;
    console.log(`data = ${simpleStringify(data)}`);
    if (status == 200) {
        rallyClient.setAuthentication(data);
    } else {
        rallyClient.setAuthentication();
        console.log("error while registering Rally App")
    }
    return data
}

module.exports = {register}
  