const AWS = require('aws-sdk');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️ Scrapping Lambda data!');

    const lambda = new AWS.Lambda({ apiVersion: '2015-03-31', region: account.Region, ...credentialsParams });
    const data = {
        type: 'lambda', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { Marker: null };

    do {
        const result = await lambda.listFunctions(params).promise();
        params.Marker = result.NextMarker;
        result.Functions.forEach((i) => data.items.push(i));
    } while (params.Marker);
    return data;
};
