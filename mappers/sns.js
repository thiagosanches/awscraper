const _ = require('underscore');
const baseObject = require('../common/baseObject');

module.exports.map = async function (data) {
    baseObject.AccountId = data.accountId;
    baseObject.AccountName = data.accountName;
    baseObject.ResourceRegion = data.region;
    return {
        type: data.type,
        items: _.map(data.items, (m) => ({
            Id: m.TopicArn,
            RawObj: JSON.stringify(m),
            ...baseObject,
        })),
    };
};
