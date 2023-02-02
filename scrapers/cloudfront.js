const AWS = require('aws-sdk');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️ Scrapping CloudFront data!');

    const cloudfront = new AWS.CloudFront({ apiVersion: '2020-05-31', ...credentialsParams });
    const data = {
        type: 'cloudfront', items: [], accountId: account.Id, accountName: account.Name,
    };
    const params = {};

    do {
        const result = await cloudfront.listDistributions(params).promise();
        if (result.DistributionList
            && result.DistributionList.Items) {
            params.Marker = result.DistributionList.NextMarker;
            result.DistributionList.Items.forEach((i) => data.items.push(i));
        }
    } while (params.Marker);

    return data;
};
