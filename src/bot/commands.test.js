const {validateRules} = require("./commands");

test('Valid nft rule', () => {
  const {channel, rules} = validateRules(" test_channel 32c1245d76ad21d376d789cda3:1 ,  898232c5c767dea7821d43a213:2")
  expect(channel).toBe("test_channel");
  expect(rules).toBe("32c1245d76ad21d376d789cda3:1,898232c5c767dea7821d43a213:2");
});

test('Valid coin rule', () => {
  const {channel, rules} = validateRules(" test_channel 32c1245d76ad21d376d789cda3:132.45 ,  898232c5c767dea7821d43a213:45113.9896")
  expect(channel).toBe("test_channel");
  expect(rules).toBe("32c1245d76ad21d376d789cda3:132.45,898232c5c767dea7821d43a213:45113.9896");
});

test('Missing channel name', () => {
  expect(() => validateRules(" 32c1245d76ad21d376d789cda3:132.45 ,  898232c5c767dea7821d43a213:45113.9896"))
    .toThrow("invalid/missing channel name")
});

test('Invalid coin rules', () => {
  expect(() => validateRules(" test_channel 32c1245d76ad21d376d789cda3 ,  898232c5c767dea7821d43a213:45113.9896"))
   .toThrow(("invalid/missing rules"))

});