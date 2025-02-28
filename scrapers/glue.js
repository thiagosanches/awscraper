const AWS = require('aws-sdk');
const mapper = require('../mappers/glue');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping Glue data!');

    const glue = new AWS.Glue({ apiVersion: '2017-03-31', region: account.Region, ...credentialsParams });
    const data = {
        type: 'glue', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };

    const params = { NextToken: null };

    do {
        const result = await glue.getJobs(params).promise();
        params.NextToken = result.NextToken;
        if (result.Jobs) {
            result.Jobs.forEach((i) => data.items.push(i));
        }
    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};
