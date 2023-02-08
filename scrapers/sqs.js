const AWS = require('aws-sdk');
const mapper = require('../mappers/sqs');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping SNS data!');

    const sns = new AWS.SQS({ apiVersion: '2012-11-05', region: account.Region, ...credentialsParams });
    const data = {
        type: 'sqs', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { NextToken: null };

    do {
        const result = await sns.listQueues(params).promise();
        params.NextToken = result.NextToken;
        if (result.QueueUrls) {
            result.Topics.forEach((i) => data.items.push({ Url: i }));
        }
    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};
