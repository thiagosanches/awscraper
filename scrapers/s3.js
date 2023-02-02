const AWS = require('aws-sdk');

module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️ Scrapping S3 data!');

    const s3 = new AWS.S3({ apiVersion: '2006-03-01', region: account.Region, ...credentialsParams });
    const data = {
        type: 's3', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };
    const params = { NextToken: null };
    const promises = [];

    do {
        const result = await s3.listBuckets(params).promise();
        params.NextToken = result.NextToken;

        for (let i = 0; i < result.Buckets.length; i += 1) {
            const obj = result.Buckets[i];
            obj.Encryption = s3.getBucketEncryption({ Bucket: obj.Name }).promise();
            obj.Tags = s3.getBucketTagging({ Bucket: obj.Name }).promise();
            data.items.push(obj);

            promises.push(obj.Encryption);
            promises.push(obj.Tags);
        }
    } while (params.NextToken);

    await Promise.allSettled(promises);
    data.items.forEach((b) => b.Encryption.then(
        (r) => {
            b.Encryption = r;
        },
        (e) => {
            b.Encryption = e.code;
        },
    ));

    data.items.forEach((b) => b.Tags.then(
        (r) => {
            b.Tags = r.TagSet;
        },
        (e) => {
            b.Tags = e.code;
        },
    ));

    return data;
};
