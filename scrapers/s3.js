const AWS = require('aws-sdk');
const mapper = require('../mappers/s3');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping S3 data!');

    const s3 = new AWS.S3({ apiVersion: '2006-03-01', ...credentialsParams });
    const data = {
        type: 's3', items: [], accountId: account.Id, accountName: account.Name,
    };
    const params = { NextToken: null };

    do {
        const result = await s3.listBuckets(params).promise();
        params.NextToken = result.NextToken;

        for (let i = 0; i < result.Buckets.length; i += 1) {
            const obj = result.Buckets[i];

            obj.Encryption = s3.getBucketEncryption({ Bucket: obj.Name }).promise()
                .then((value) => obj.Encryption = value.ServerSideEncryptionConfiguration)
                .catch(() => obj.Encryption = 'ServerSideEncryptionConfigurationNotFoundError');

            s3.getBucketTagging({ Bucket: obj.Name }).promise()
                .then((value) => obj.Tags = value.TagSet)
                .catch(() => obj.Tags = []);

            const inteligentTieringConfigurations = await s3.listBucketIntelligentTieringConfigurations({
                Bucket: obj.Name,
            }).promise();
            obj.InteligentTieringConfigurations = inteligentTieringConfigurations;
            data.items.push(obj);
        }
    } while (params.NextToken);

    for (let i = 0; i < data.items.length; i += 1) {
        const obj = data.items[i];
        const encryption = await obj.Encryption;
        if (encryption !== 'ServerSideEncryptionConfigurationNotFoundError') {
            obj.Encryption = encryption;
        } else {
            obj.Encryption = [];
        }
    }

    const result = await mapper.map(data);
    return result;
};
