const expect = require('chai').expect
const { assert } = require('chai')
const sinon = require('sinon')
const slackUserClient = require('../../src/bot/client')
const { validateRules, setNFTRules, requestPrivateChannel } = require('../../src/bot/commands')
const db = require('../../src/models')
const { rallyClient, callback } = require('../../src/rally')
const { mockResponse } = require('mock-req-res')

describe('Rally callback', () => {
  describe('Set rules', () => {
    let updateStub, challengeStub, channelStub, userStub, res
    let requestRallyAccountIdStub, balanceStub, nftStub
    let inviteStub
    const req = { url: 'https://example.com/?code=code&state=state' }
    beforeEach(() => {
      res = mockResponse({ writeHead: sinon.spy() })
      requestRallyAccountIdStub = sinon.stub(rallyClient, 'requestRallyAccountId').returns('test_rally_wallet_id')
      balanceStub = sinon.stub(rallyClient, 'balance')
      nftStub = sinon.stub(rallyClient, 'nft')
      inviteStub = sinon.stub(slackUserClient.conversations, 'invite')

      challengeStub = sinon.stub(db.RallyChallenge, 'findOne').callsFake(({ where }) => {
        assert(where.rally_state == 'state')
        return { user_id: 1, channel_id: 1, state: 'state', required_rules: 'dummy_coin:2.5|dummy_nft:1' }
      })
      channelStub = sinon.stub(db.Channel, 'findOne').callsFake(({ where }) => {
        assert(where.id == 1)
        return { channel_name: 'test_channel', coin_rules: 'dummy_coin:2.5', nft_rules: 'dummy_nft:1' }
      })
      userStub = sinon.stub(db.User, 'findOne').callsFake(({ where }) => {
        assert(where.id == 1)
        return { slack_id: 'test_user' }
      })
      updateStub = sinon.stub(db.RallyChallenge, 'update').callsFake(({ settled, rally_account_id }, { where }) => {
        assert(where.rally_state == 'state')
        assert(settled == true)
        assert(rally_account_id == 'test_rally_wallet_id')
      })
    })
    afterEach(() => {
      requestRallyAccountIdStub.restore()
      balanceStub.restore()
      nftStub.restore()
      inviteStub.restore()
      challengeStub.restore()
      channelStub.restore()
      userStub.restore()
      updateStub.restore()
      res.json.resetHistory()
    })

    it('Basic functionality', async () => {
      balanceStub.returns(2.5)
      nftStub.returns(1)
      await callback(req, res)

      sinon.assert.calledOnce(challengeStub)
      sinon.assert.calledOnce(channelStub)
      sinon.assert.calledOnce(userStub)
      sinon.assert.calledOnce(updateStub)
      sinon.assert.calledOnceWithExactly(requestRallyAccountIdStub, 'code')
      sinon.assert.calledOnceWithExactly(balanceStub, 'test_rally_wallet_id', 'dummy_coin')
      sinon.assert.calledOnceWithExactly(nftStub, 'test_rally_wallet_id', 'dummy_nft')
      sinon.assert.calledOnceWithExactly(inviteStub, { channel: 'test_channel', users: 'test_user' })
    })
    it('Requirement unmet by user', async () => {
      balanceStub.returns(1)
      nftStub.returns(1)
      await callback(req, res)

      sinon.assert.calledOnce(challengeStub)
      sinon.assert.calledOnce(channelStub)
      sinon.assert.calledOnce(userStub)
      sinon.assert.calledOnceWithExactly(requestRallyAccountIdStub, 'code')
      sinon.assert.calledOnceWithExactly(balanceStub, 'test_rally_wallet_id', 'dummy_coin')
      sinon.assert.notCalled(nftStub)
      sinon.assert.notCalled(inviteStub)
      sinon.assert.notCalled(updateStub)
    })
  })
})
