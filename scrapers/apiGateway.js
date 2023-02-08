const AWS = require('aws-sdk');
const mapper = require('../mappers/ec2');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping ApiGateway data!');

    const ag = new AWS.APIGateway({ apiVersion: '2016-11-15', region: account.Region, ...credentialsParams });
    const data = {
        type: 'ag', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };

    const params = {
        limit: 500,
        position: null
    };

    do {
        const result = await ag.getRestApis(params).promise();
        params.position = result.position;

        if (result.items)
            result.items.forEach((i) => data.items.push(i));

    } while (params.position);

    const result = await mapper.map(data);
    return result;
};
