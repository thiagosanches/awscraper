const AWS = require('aws-sdk');
const mapper = require('../mappers/ssm');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping SSM data!');

    const ssm = new AWS.SSM({ apiVersion: '2016-11-15', region: account.Region, ...credentialsParams });
    const data = {
        type: 'ssm', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { NextToken: null };

    do {
        const result = await ssm.describeParameters(params).promise();
        params.NextToken = result.NextToken;
        result.Parameters.forEach((i) => data.items.push(i));

        for (let i = 0; i < result.Parameters.length; i++) {
            const parameter = await ssm.getParameter({ Name: result.Parameters[i].Name, WithDecryption: true }).promise();
            data.items.push(parameter.Parameter);
        }
    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};
