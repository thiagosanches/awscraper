const AWS = require('aws-sdk');
const mapper = require('../mappers/nat');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping NAT data!');

    const ec2 = new AWS.EC2({ apiVersion: '2016-11-15', region: account.Region, ...credentialsParams });
    const data = {
        type: 'nat', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { NextToken: null };

    do {
        const result = await ec2.describeNatGateways(params).promise();
        params.NextToken = result.NextToken;
        result.NatGateways.forEach((i) => data.items.push(i));
    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};
