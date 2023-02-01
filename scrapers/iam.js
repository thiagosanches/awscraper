const AWS = require('aws-sdk')

module.exports.scrape = async function () {
    console.log("⚙️ Scrapping EC2 data!")

    const iam = new AWS.IAM({ apiVersion: '2010-05-08' })
    const data = { type: 'iam', items: [] }
    const params = { Marker: null }
    const promises = []

    do {
        const result = await iam.listUsers(params).promise()
        params.Marker = result.Marker
        for (let i = 0; i < result.Users.length; i++) {
            const obj = result.Users[i]
            obj.AccessKeys = iam.listAccessKeys({ UserName: obj.UserName }).promise()
            data.items.push(obj)
            
            promises.push(obj.AccessKeys)

        }
    } while (params.Marker)
    await Promise.allSettled(promises)
    data.items.forEach(b => b.AccessKeys.then((r) => { b.AccessKeys = r.AccessKeyMetadata }, (e) => { b.AccessKeys = e.code }))

    return data
}
