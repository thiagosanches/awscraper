const _ = require('underscore');
const baseObject = require('../common/baseObject');

module.exports.map = async function (data) {
    baseObject.AccountId = data.accountId;
    baseObject.AccountName = data.accountName;
    baseObject.ResourceRegion = data.region;
    return {
        type: data.type,
        ...baseObject,
        items: _.map(data.items, (m) => ({
            Id: m.TableArn,
            RawObj: JSON.stringify(m),
            ...baseObject,
        })),
    };
};
