const AWS = require('aws-sdk'); const mapper = require('../mappers/glue'); module.exports.scrape = async function (account, credentialsParams) {
    console.log('⚙️  Scrapping Glue data!');

    const glue = new AWS.Glue({ apiVersion: '2017-03-31', region: account.Region, ...credentialsParams });
    const data = {
        type: 'glue', items: [], accountId: account.Id, accountName: account.Name, region: account.Region,
    };

    const params = { NextToken: null };

    do {
        const result = await glue.getJobs(params).promise();
        for (const job of result.Jobs) {

            const jobRuns = await glue.getJobRuns({ JobName: job.Name, MaxResults: 2 }).promise();

            job.Executions = [];
            if (jobRuns.JobRuns &&
                jobRuns.JobRuns.length > 0) {
                jobRuns.JobRuns[0].HoursExecutionTime = jobRuns.JobRuns[0].ExecutionTime / 3600;
                jobRuns.JobRuns[0].MinutesExecutionTime = jobRuns.JobRuns[0].ExecutionTime / 60;
                if (jobRuns.JobRuns[1]) { // TODO: REFACTOR THIS
                    jobRuns.JobRuns[1].HoursExecutionTime = jobRuns.JobRuns[1].ExecutionTime / 3600;
                    jobRuns.JobRuns[1].MinutesExecutionTime = jobRuns.JobRuns[1].ExecutionTime / 60;
                }
                job.Executions.push(...jobRuns.JobRuns);
            }
            data.items.push(job);
        }
        params.NextToken = result.NextToken;

    } while (params.NextToken);

    const result = await mapper.map(data);
    return result;
};