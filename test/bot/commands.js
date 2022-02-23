var expect    = require("chai").expect;
const { assert } = require("chai");
const sinon = require("sinon");
const {validateRules, setNFTRules, requestPrivateChannel} = require("../../src/bot/commands");
const db = require("../../src/models");
const { rallyClient } = require("../../src/rally");

describe('Bot commands', () => {
  describe('Set rules', () => {
    let findOneStub, updateStub;
    beforeEach(()=>{
      findOneStub = sinon.stub(db.Channel, "findOne").callsFake(({where}) => {
         if (where.channel_name == "test_channel"){
           return "test_channel"
         }
         return null
      });
      updateStub = sinon.stub(db.Channel, "update").callsFake(({nft_rules},{where}) => {
      });
    })
    afterEach(()=>{
      findOneStub.restore()
      updateStub.restore()
    })

    it('Basic functionality', async () => {
      say = sinon.stub()
      ack = sinon.stub()

      await setNFTRules({ command: 
        {text: "<#test_channel|> 32c1245d76ad21d376d789cda3:1 ,  898232c5c767dea7821d43a213:2"},
        ack, say})
      sinon.assert.calledOnce(findOneStub)
      sinon.assert.calledOnce(updateStub)
      sinon.assert.calledOnce(ack)
      sinon.assert.calledOnce(say)
      sinon.assert.calledWith(say, `Rules changed!`)
    });

    it('Channel not found', async () => {
      say = sinon.stub()
      ack = sinon.stub()

      await setNFTRules({ command: 
        {text: "<#unknown_channel|> 32c1245d76ad21d376d789cda3:1 ,  898232c5c767dea7821d43a213:2"},
        ack, say})
      sinon.assert.calledOnce(findOneStub)
      sinon.assert.notCalled(updateStub)
      sinon.assert.calledOnce(ack)
      sinon.assert.calledOnce(say)
      sinon.assert.calledWith(say, `Channel not found!`)
    });
  });

  describe('Request private channel', () => {
    let findOneStub, userFindOrCreateStub;
    beforeEach(()=>{
      findOneStub = sinon.stub(db.Channel, "findOne").callsFake(({where}) => {
         if (where.channel_name == "test_channel"){
           return {id: "test_channel", nft_rules:"dummy_nft:1", coin_rules: "dummy_coin:2.5"}
         }
         return null
      });
      userFindOrCreateStub = sinon.stub(db.User, "findOrCreate").callsFake(({where}) => {
        console.log(where.slack_id)

        if (where.slack_id == "test_user"){
          const out = [{id: "test_user"}, false]
          console.log(out)
          return out
        }
        return null
      });
    });
    afterEach(()=>{
      findOneStub.restore()
      userFindOrCreateStub.restore()
    });

    it('Basic functionality', async () => {
      say = sinon.stub()
      ack = sinon.stub()
      challengeFindOrCreate = sinon.stub(db.RallyChallenge, "findOrCreate").callsFake(({where}) => {
        assert (where.user_id === "test_user" && where.channel_id === "test_channel")
      });
      requestAuthorizationStub = sinon.stub(rallyClient, "requestAuthorization").returns(
        {
          "url": "https://dummy",
          "state": "dummy"
        }
      )

      await requestPrivateChannel({ command: 
        {text: "<#test_channel|>", user_id: "test_user"},
        ack, say})
      
      sinon.assert.calledOnce(findOneStub)
      sinon.assert.calledOnce(userFindOrCreateStub)
      sinon.assert.calledOnce(requestAuthorizationStub)
      sinon.assert.calledOnce(ack)
      sinon.assert.calledWith(say, `Please follow this link to fullfill the challenge using your Rally account: \nhttps://dummy`)
    });
  });

  describe('Validate rules', () => {
    it('Valid nft rule', () => {
      const {channel, rules} = validateRules("<#test_channel|> 32c1245d76ad21d376d789cda3:1 ,  898232c5c767dea7821d43a213:2")
      expect(channel).to.equal("test_channel");
      expect(rules).to.equal("32c1245d76ad21d376d789cda3:1,898232c5c767dea7821d43a213:2");
    });

    it('Valid coin rule', () => {
      const {channel, rules} = validateRules(" <#test_channel|> 32c1245d76ad21d376d789cda3:132.45 ,  898232c5c767dea7821d43a213:45113.9896")
      expect(channel).to.equal("test_channel");
      expect(rules).to.equal("32c1245d76ad21d376d789cda3:132.45,898232c5c767dea7821d43a213:45113.9896");
    });

    it('Missing channel name', () => {
      expect(() => validateRules(" 32c1245d76ad21d376d789cda3:132.45 ,  898232c5c767dea7821d43a213:45113.9896"))
        .to.throw("invalid/missing channel name")
    });

    it('Invalid coin rules', () => {
      expect(() => validateRules(" <#test_channel|> 32c1245d76ad21d376d789cda3 ,  898232c5c767dea7821d43a213:45113.9896"))
      .to.throw("invalid/missing rules")

    });

    it('Set nft rules', () => {
      expect(() => validateRules(" <#test_channel|> 32c1245d76ad21d376d789cda3 ,  898232c5c767dea7821d43a213:45113.9896"))
      .to.throw("invalid/missing rules")
    });
  });
});