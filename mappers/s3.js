const _ = require('underscore');
const baseObject = require('../common/baseObject');

module.exports.map = async function (data) {
    baseObject.AccountId = data.accountId;
    baseObject.AccountName = data.accountName;
    return {
        type: data.type,
        items: _.map(data.items, (m) => ({
            Id: m.Name,
            RawObj: JSON.stringify(m),
            ...baseObject,
        })),
    };
};
