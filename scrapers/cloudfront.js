const AWS = require('aws-sdk')

module.exports.scrape = async function () {
    console.log("   Scrapping CloudFront data!")

    const cloudfront = new AWS.CloudFront({ apiVersion: '2020-05-31' });
    const data = []
    const params = {}

    do {
        const result = await cloudfront.listDistributions(params).promise()
        if (result.DistributionList &&
            result.DistributionList.Items) {
            params.Marker = result.DistributionList.NextMarker
            result.DistributionList.Items.forEach(i => data.push(i))
        }
    } while (params.Marker)

    console.log(data)
    return data
}
