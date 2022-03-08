
const schedule = require('node-schedule');
const { rallyClient } = require('.');
const {httpPost} = require("./utils");

async function register() {
    console.log(`Trying to register to Rally, username: ${rallyClient.username}, password: ${rallyClient.password} `);
    const username = rallyClient.username;
    const password = rallyClient.password;
    let renewDate = Date.now() +  60 * 1000; // Default: Retrying in a minute!
    try {
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
        }
    }catch(err){
        console.log(`error while Registering rally App: ${err}`)
    }
    schedule.scheduleJob(renewDate, function(){
        console.log(`Trying to renew the Rally credentials, username: ${rallyClient.username}, password: ${rallyClient.password} `);
        register();
    });
}

module.exports = {register}
  