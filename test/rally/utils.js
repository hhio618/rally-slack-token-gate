const expect = require('chai').expect
const sinon = require('sinon')
const { parseRules } = require('../../src/bot/utils')

describe('Rally utils', () => {
  describe('parse rules', () => {
    it('coin rules only', async () => {
      const { coin_rules, nft_rules } = parseRules('KSK:1|')
      expect(coin_rules).to.deep.equal({ KSK: 1 })
      expect(nft_rules).to.deep.equal({})
    })
  })
})
