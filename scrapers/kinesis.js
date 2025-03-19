const AWS = require('aws-sdk');
const mapper = require('../mappers/kinesis');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping Apache Flink data!');

    const kinesis = new AWS.KinesisAnalyticsV2({ region: account.Region, ...credentialsParams });
    const data = {
        type: 'kinesis', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };

    const params = { NextToken: null };

    do {
        const result = await kinesis.listApplications(params).promise();
        console.log(result);

        for (const kinesisApp of result.ApplicationSummaries) {
            const appDetails = await kinesis.describeApplication({ ApplicationName: kinesisApp.ApplicationName }).promise();
            kinesisApp.Details = appDetails.ApplicationDetail;
            kinesisApp.Name = kinesisApp.ApplicationName;
            data.items.push(kinesisApp);
        }
        params.NextToken = result.NextToken;

    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};