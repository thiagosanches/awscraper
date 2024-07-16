const AWS = require('aws-sdk');
const mapper = require('../mappers/autoscalinggroups');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping AutoScaling data!');

    const autoscaling = new AWS.AutoScaling({ apiVersion: '2011-01-01', region: account.Region, ...credentialsParams });
    const data = {
        type: 'autoscalinggroups', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { NextToken: null };

    do {
        const result = await autoscaling.describeAutoScalingGroups(params).promise();
        params.NextToken = result.NextToken;
        result.AutoScalingGroups.forEach((i) => data.items.push(i));
    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};
