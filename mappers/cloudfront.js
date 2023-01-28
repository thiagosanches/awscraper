const _ = require('underscore')
const baseObject = require('../common/baseObject')

module.exports.map = async function (data) {
    return {
        type: data.type,
        items: _.map(data.items, function (m) {
            return {
                Id: m.Id,
                ARN: m.ARN,
                DomainName: m.DomainName,
                WebACLId: m.WebACLId,
                AliasICPRecordals: _.map(m.AliasICPRecordals,
                    function (obj) { return obj.CNAME }).join(', '),
                RawObj: JSON.stringify(m),
                ...baseObject
            }
        })
    }
}
