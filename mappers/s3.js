const _ = require('underscore')
const baseObject = require('../common/baseObject')

module.exports.map = async function (data) {
    return {
        type: data.type,
        items: _.map(data.items, function (m) {
            return {
                Id: m.Name,
                RawObj: JSON.stringify(m),
                ...baseObject
            }
        })
    }
}
