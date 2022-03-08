var expect    = require("chai").expect;
const axios = require("axios").default;
const sinon = require("sinon");
const { httpPost } = require("../../src/rally/utils");

describe('Bot utils', () => {
    describe('axios', () => {
        it.only("test setConfig", async ()=>{
            const postStub = sinon.stub(axios, "post")
            await httpPost("dummy", {user: "dummy", pass: "pass"})
            // sinon.assert.calledWith(postStub, "dummy", {user: "dummy", pass: "pass"}, {headers: {"Content-Type" :"application/json"}})
        })
    })
})