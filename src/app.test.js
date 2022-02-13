'use strict';

// Loading the .env file if exists.
require('dotenv').config();
const { db } = require("./models");



beforeAll(() => {

});
afterAll(() => {

});

test('Dummy', () => {
  expect("test" )
   .toBe("test")
});