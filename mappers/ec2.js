const _ = require('underscore');
const baseObject = require('../common/baseObject');

module.exports.map = async function (data) {
    return {
        type: data.type,
        items: _.map(data.items, (m) => ({
            Id: m.InstanceId,
            RawObj: JSON.stringify(m),
            ...baseObject,
        })),
    };
};
