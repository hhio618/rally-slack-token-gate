const expect = require('chai').expect
const axios = require('axios').default
const sinon = require('sinon')
const { httpPost } = require('../../src/rally/utils')

describe('Bot utils', () => {
  describe('axios', () => {
    it('test setConfig', async () => {
      const postStub = sinon.stub(axios, 'post')
      await httpPost('dummy', { user: 'dummy', pass: 'pass' }, { Authorization: 'dummy' })
      sinon.assert.calledWith(postStub, 'dummy', { user: 'dummy', pass: 'pass' }, { headers: { 'Content-Type': 'application/json', Authorization: 'dummy' } })
    })
  })
})
