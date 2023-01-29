const AWS = require('aws-sdk')

module.exports.scrape = async function () {
    console.log("⚙️ Scrapping S3 data!")

    const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    const data = { type: 's3', items: [] }
    const params = { NextToken: null }
    const promises = []

    do {
        const result = await s3.listBuckets(params).promise()
        params.NextToken = result.NextToken

        for (let i = 0; i < result.Buckets.length; i++) {
            const obj = result.Buckets[i]
            try {
                obj.Encryption = s3.getBucketEncryption({ Bucket: obj.Name }).promise()
            } catch (e) {
                obj.Encryption = e.code
            }
            data.items.push(obj)
            promises.push(obj.Encryption)
        }
    } while (params.NextToken)
    await Promise.allSettled(promises)
    data.items.forEach(b => b.Encryption.then((r) => {
        b.Encryption = r
    }, (e) => {
        b.Encryption = e.code
    }))
    return data
}
