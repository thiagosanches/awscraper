const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Mock data configurations
const resourceTypes = [
    'Lambda', 'EC2', 'S3', 'RDS', 'DynamoDB', 'API-Gateway',
    'SecurityGroup', 'CloudFront', 'SNS', 'SQS', 'EBS', 'NAT',
    'SSM', 'AutoScalingGroups', 'DMS', 'Glue', 'Kinesis',
    'ElasticBeanstalk', 'Route53', 'IAMUsers',
];

const regions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-central-1',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
    'sa-east-1', 'ca-central-1',
];

const teams = [
    'Platform', 'Backend', 'Frontend', 'Data', 'DevOps',
    'Security', 'Infrastructure', 'QA', 'Mobile', 'Analytics',
];

const accounts = [
    { id: '123456789012', name: 'Production' },
    { id: '234567890123', name: 'Development' },
    { id: '345678901234', name: 'Staging' },
    { id: '456789012345', name: 'Testing' },
];

const statuses = ['LIVE', 'LIVE', 'LIVE', 'DELETED']; // 75% LIVE, 25% DELETED

const comments = [
    'Critical production resource',
    'Scheduled for migration',
    'Legacy system - to be deprecated',
    'New deployment',
    'Under monitoring',
    'Backup resource',
    'Testing environment',
    null,
    null,
    null,
];

// Helper functions
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateResourceId(type) {
    const prefixes = {
        Lambda: 'lambda-function',
        EC2: 'i',
        S3: 's3-bucket',
        RDS: 'rds-db',
        DynamoDB: 'dynamodb-table',
        'API-Gateway': 'api-gateway',
        SecurityGroup: 'sg',
        CloudFront: 'cloudfront-dist',
        SNS: 'sns-topic',
        SQS: 'sqs-queue',
        EBS: 'vol',
        NAT: 'nat',
        SSM: 'ssm-param',
        AutoScalingGroups: 'asg',
        DMS: 'dms-task',
        Glue: 'glue-job',
        Kinesis: 'kinesis-stream',
        ElasticBeanstalk: 'eb-env',
        Route53: 'route53-zone',
        IAMUsers: 'iam-user',
    };

    const prefix = prefixes[type] || 'resource';
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    return `${prefix}-${randomSuffix}`;
}

function generateRawObj(type, id, region) {
    // Simplified mock AWS object
    return JSON.stringify({
        ResourceType: type,
        ResourceId: id,
        Region: region,
        Tags: [
            { Key: 'Environment', Value: randomChoice(['prod', 'dev', 'staging']) },
            { Key: 'ManagedBy', Value: 'terraform' },
        ],
        CreatedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        Metadata: {
            Description: `Mock ${type} resource`,
            Version: '1.0',
        },
    });
}

function getLastModified() {
    // Random date within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString().replace('T', ' ').substring(0, 19);
}

// Generate mock data
function generateMockResources(count = 100) {
    const resources = [];

    for (let i = 0; i < count; i++) {
        const type = randomChoice(resourceTypes);
        const region = randomChoice(regions);
        const account = randomChoice(accounts);
        const id = generateResourceId(type, i);
        const status = randomChoice(statuses);
        const team = Math.random() > 0.3 ? randomChoice(teams) : null;
        const comment = randomChoice(comments);

        resources.push({
            Id: id,
            AccountId: account.id,
            AccountName: account.name,
            Region: region,
            Type: type,
            Status: status,
            Team: team,
            Comments: comment,
            LastModified: getLastModified(),
            RawObj: generateRawObj(type, id, region),
        });
    }

    return resources;
}

// Insert data into database
function insertMockData(resources) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create table if not exists
            db.run(`CREATE TABLE IF NOT EXISTS "resources" (
                "Id" TEXT NOT NULL,
                "AccountId" TEXT NOT NULL,
                "AccountName" TEXT NOT NULL,
                "Region" TEXT NOT NULL,
                "Type" TEXT,
                "Status" TEXT NOT NULL,
                "Team" TEXT,
                "Comments" TEXT,
                "LastModified" TEXT NOT NULL,
                "RawObj" TEXT,
                PRIMARY KEY("Id")
            )`, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                    reject(err);
                }
            });

            // Clear existing data
            db.run('DELETE FROM resources', (err) => {
                if (err) {
                    console.error('Error clearing table:', err);
                    reject(err);
                    return;
                }
                console.log('✓ Cleared existing data');
            });

            // Prepare insert statement
            const stmt = db.prepare(`
                INSERT INTO resources (Id, AccountId, AccountName, Region, Type, Status, Team, Comments, LastModified, RawObj)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            let inserted = 0;
            resources.forEach((resource) => {
                stmt.run(
                    resource.Id,
                    resource.AccountId,
                    resource.AccountName,
                    resource.Region,
                    resource.Type,
                    resource.Status,
                    resource.Team,
                    resource.Comments,
                    resource.LastModified,
                    resource.RawObj,
                    (err) => {
                        if (err) {
                            console.error('Error inserting resource:', err);
                        } else {
                            inserted++;
                        }
                    },
                );
            });

            stmt.finalize((err) => {
                if (err) {
                    console.error('Error finalizing statement:', err);
                    reject(err);
                } else {
                    console.log(`✓ Inserted ${inserted} mock resources`);
                    resolve(inserted);
                }
            });
        });
    });
}

// Main execution
async function main() {
    const count = parseInt(process.argv[2], 10) || 150;
    console.log(`Generating ${count} mock AWS resources...`);

    const resources = generateMockResources(count);

    // Group by type for summary
    const summary = {};
    resources.forEach((r) => {
        summary[r.Type] = (summary[r.Type] || 0) + 1;
    });

    console.log('\nResource distribution:');
    Object.entries(summary)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, total]) => {
            console.log(`  ${type}: ${total}`);
        });

    try {
        await insertMockData(resources);
        console.log('\n✓ Mock data generation complete!');
        console.log(`Database location: ${dbPath}`);

        // Close database
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('✓ Database connection closed');
            }
        });
    } catch (err) {
        console.error('Failed to insert data:', err);
        process.exit(1);
    }
}

main();
