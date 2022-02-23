var expect    = require("chai").expect;
const { assert } = require("chai");
const sinon = require("sinon");
const { bot, slackUserClient } = require("../../src/bot");
const {validateRules, setNFTRules, requestPrivateChannel} = require("../../src/bot/commands");
const db = require("../../src/models");
const { rallyClient } = require("../../src/rally");

describe('Rally callback', () => {
  describe('Set rules', () => {
    let challengeStub, channelStub, userStub;
    let query = {code: "code", state: "state"}
    beforeEach(()=>{
      challengeStub = sinon.stub(db.RallyChallenge, "findOne").callsFake(({where}) => {
        assert (where.state == "state");
        return {user_id: 1, channel_id: 1, state: "state", required_rules: "dummy_coin:2.5|dummy_nft:1"}
      });
      channelStub = sinon.stub(db.Channel, "findOne").callsFake(({where}) => {
        assert (where.id == 1);
        return {channel_name: "test_channel", coin_rules: "dummy_coin:2.5", nft_rules: "dummy_nft:1"}
      });
      userStub = sinon.stub(db.User, "findOne").callsFake(({where}) => {
        assert (where.id == 1);
        return {slack_id: "test_user"}
      });
    });
    afterEach(()=>{
      challengeStub.restore()
      channelStub.restore()
      userStub.restore()
    });

    it('Basic functionality', async () => {
      const requestRallyAccountIdStub = sinon.stub(rallyClient, "requestRallyAccountId").returns("test_rally_wallet_id")
      const balanceStub = sinon.stub(rallyClient, "balance").returns(2.5)
      const nftStub = sinon.stub(rallyClient, "nft").returns(1)
      const inviteStub = sinon.stub(slackUserClient.conversations, "invite")
      await bot.customRoutes[0].handler({query}, sinon.fake())
      
      sinon.assert.calledOnce(challengeStub)
      sinon.assert.calledOnce(channelStub)
      sinon.assert.calledOnce(userStub)
      sinon.assert.calledOnceWithExactly(requestRallyAccountIdStub, query.code)
      sinon.assert.calledOnceWithExactly(balanceStub, "dummy_coin")
      sinon.assert.calledOnceWithExactly(nftStub, "dummy_nft")
      sinon.assert.calledOnceWithExactly(inviteStub, {channel: "test_channel", user: "test_user"})
    });
    it('Requirement unmet by user', async () => {
        const requestRallyAccountIdStub = sinon.stub(rallyClient, "requestRallyAccountId").returns("test_rally_wallet_id")
        const balanceStub = sinon.stub(rallyClient, "balance").returns(1)
        const nftStub = sinon.stub(rallyClient, "nft").returns(1)
        const inviteStub = sinon.stub(slackUserClient.conversations, "invite")
        await bot.customRoutes[0].handler({query}, sinon.fake())
        
        sinon.assert.calledOnce(challengeStub)
        sinon.assert.calledOnce(channelStub)
        sinon.assert.calledOnce(userStub)
        sinon.assert.calledOnceWithExactly(requestRallyAccountIdStub, query.code)
        sinon.assert.calledOnceWithExactly(balanceStub, "dummy_coin")
        sinon.assert.notCalled(nftStub)
        sinon.assert.notCalled(inviteStub)
      });
  })
});