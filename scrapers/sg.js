const AWS = require('aws-sdk');
const mapper = require('../mappers/sg');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping SecurityGroup data!');

    const ec2 = new AWS.EC2({ apiVersion: '2016-11-15', region: account.Region, ...credentialsParams });
    const data = {
        type: 'sg', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { NextToken: null };

    do {
        const result = await ec2.describeSecurityGroups(params).promise();
        params.NextToken = result.NextToken;
        data.items.push(...result.SecurityGroups)
    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};
