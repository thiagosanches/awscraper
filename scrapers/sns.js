const AWS = require('aws-sdk');
const mapper = require('../mappers/sns');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping SNS data!');

    const sns = new AWS.SNS({ apiVersion: '2010-03-31', region: account.Region, ...credentialsParams });
    const data = {
        type: 'sns', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { NextToken: null };

    do {
        const result = await sns.listTopics(params).promise();
        params.NextToken = result.NextToken;
        result.Topics.forEach((i) => data.items.push(i));
    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};
