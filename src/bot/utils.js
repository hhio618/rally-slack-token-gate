const { identity } = require("lodash")


function toDict(txt, is_float=false){
    let out = {};
    const rules = txt.split(",");
    for (const rule of rules){
        const [id, value] = rule.split(":");
        let numValue;
        if (is_float){
            numValue = parseFloat(value.trim());
        }else{
            numValue = parseInt(parseFloat(value.trim()));
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