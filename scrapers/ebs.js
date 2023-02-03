const AWS = require('aws-sdk');
const mapper = require('../mappers/ebs');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping EBS data!');

    const ec2 = new AWS.EC2({ apiVersion: '2016-11-15', region: account.Region, ...credentialsParams });
    const data = {
        type: 'ebs', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { NextToken: null };

    do {
        const result = await ec2.describeVolumes(params).promise();

        params.NextToken = result.NextToken;
        result.Volumes.forEach((i) => data.items.push(i));
    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};
