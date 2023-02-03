const AWS = require('aws-sdk');
const mapper = require('../mappers/ec2');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping ElasticBeanstalk data!');

    const eb = new AWS.ElasticBeanstalk({ apiVersion: '2010-12-01', region: account.Region, ...credentialsParams });
    const data = {
        type: 'elastic-beanstalk', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { NextToken: null };

    do {
        const result = await eb.describeEnvironments(params).promise();
        params.NextToken = result.NextToken;

        if (result.Environments) {
            data.items.push(...result.Environments);
        }
    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};
