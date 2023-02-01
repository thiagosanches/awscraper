const _ = require('underscore');
const baseObject = require('../common/baseObject');

module.exports.map = async function (data) {
    return {
        type: data.type,
        items: _.map(data.items, (m) => ({
            Id: m.ARN,
            DomainName: m.DomainName,
            WebACLId: m.WebACLId,
            AliasICPRecordals: _.map(
                m.AliasICPRecordals,
                (obj) => obj.CNAME,
            ).join(', '),
            RawObj: JSON.stringify(m),
            ...baseObject,
        })),
    };
};
