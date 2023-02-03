const AWS = require('aws-sdk');
const mapper = require('../mappers/rds');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping EC2 data!');

    const rds = new AWS.RDS({ apiVersion: '2014-10-31', region: account.Region, ...credentialsParams });
    const data = {
        type: 'rds', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { Marker: null };

    do {
        const result = await rds.describeDBInstances(params).promise();
        params.Marker = result.Marker;

        if (result.DBInstances) {
            data.items.push(...result.DBInstances);
        }

        console.log(data.items)
    } while (params.Marker);

    const result = await mapper.map(data);
    return result;
};
