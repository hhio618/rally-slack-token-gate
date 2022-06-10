# Rally slack token gate bot
A bot that allows creators to set a threshold of coins needed or NFT needed to gain access to a particular Slack channel.  

## Video walkthrough
### For channel admins
[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/NQC9hnsnBu0/0.jpg)](https://www.youtube.com/watch?v=NQC9hnsnBu0)
### For users
[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/ltZPJqRdXPA/0.jpg)](https://www.youtube.com/watch?v=ltZPJqRdXPA)
## TODO's
- [ ] (Optional) Add support for multiple workspaces using team_id (1- add authorized admin command, 2- add team_id to the database)

## Slack app setup
1. Add required permissions.
2. Enable socket mode
3. Acquire required credentials.
4. Add commands and hints.
5. Add required events.

## Deploying on heruko
```sh
heroku config:set PGSSLMODE=no-verify
export DATABASE_URL=$(heroku config:get DATABASE_URL)
NODE_ENV=production  heroku run sequelize db:migrate --url $DATABASE_URL
```

## Commands
### `/add-channel`
Bot will manages this private channel, will be rejected if it's a public channel. Also deleting channel or making it public removes the channel from the bot database.  
#### Parameters:
```text
[autoremove] // Could be `true` or `false`, will remove users that are not in the bot database for that particular channel.
```

### `/remove-channel`
Removes the input channel and all it's related rules from the database and the channel will left unmanaged.

### `/list-channels`
Lists the private channels managed by this bot.

### `/channel-details`
Show rules and available stats for this channel.


### `/set-nft-rules`
Adds NFT related rules to the requested channel. channel must be already added to this bot.
#### Parameters:
```text
A list of [nft-address -> An NFT address of interest]:[min-requirements -> an integer number, default to 1] seperated by `,`.
```

### `/set-coin-rules`
Set CreatorCoin related rules on the requested channel. channel must be already added to this bot.
#### Parameters:
```text
A list of [coin-address -> A CreatorCoin address of interest]:[min-requirements -> a float number] seperated by `,`.
```

### `/request-channel`
This will send a Rally related challenge url to user. if challenge was succesful will add the user to the channel.

