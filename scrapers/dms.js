const AWS = require('aws-sdk');
const mapper = require('../mappers/dms');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping DMS (replication instances) data!');

    const dms = new AWS.DMS({ apiVersion: '2016-01-01', region: account.Region, ...credentialsParams });
    const data = {
        type: 'dms', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { Marker: null };

    do {
        const result = await dms.describeReplicationInstances(params).promise();
        params.Marker = result.Marker;

        if (result.ReplicationInstances) {
            data.items.push(...result.ReplicationInstances);
        }
    } while (params.Marker);

    const result = await mapper.map(data);
    return result;
};
