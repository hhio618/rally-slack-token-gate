const { identity } = require("lodash")


function toDict(txt, float=false){
    let out = {};
    const rules = txt.split(",");
    for (rule of rules){
        const [id, value] = rule.split(":");
        let numValue;
        if (float){
            numValue = float(value.trim());
        }else{
            numValue = int(float(value.trim()));
        }
        out[id] = numValue;
    }
    return out;
}
function parseRules(txt){
    const [coin_rules, nft_rules] = txt.split("|");
    return {coin_rules: toDict(coin_rules, true), nft_rules: toDict(nft_rules)};
}

module.exports = {parseRules}