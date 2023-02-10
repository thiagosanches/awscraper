#!/bin/bash
set -e

##report.sh
##Information: This is a little helper in order to fetch some resources that 
##are not compliance with the rules that you defined!
##USAGE: ./report.sh <path to sqlite database>

HELP_TOKEN="##"
GREEN='\033[0;32m'
NOCOLOR='\033[0m'
QUERY='query.sql'
SQLITEFILE="$1"

function help() {
	grep "$HELP_TOKEN" "$0" | sed "s/$HELP_TOKEN//g" | grep -v "HELP_TOKEN"
}

function message() {
    echo -e "${GREEN}==========================================================================================${NOCOLOR}"
    echo -e "${GREEN}$1.${NOCOLOR}"
    echo -e "${GREEN}==========================================================================================${NOCOLOR}"
}

# Just to avoid repeating the same commands accross the other reports,
# if you need to change the output format, just play around with the commands.
function format_report_data() {
    cat | sort -u | \
    sed 's/"null"/""/g' | \
    column -t -s','
}

if [[ $# -ne 1 ]]
then
	help; exit 1
fi

# Checks for sqlite3 installed on the system.
which sqlite3 > /dev/null || (echo "You have to install sqlite3!"; exit 1)

DATELIMIT=$(date -d -90days +%Y-%m-%d)
message "AWS AccessKeys that are under the date limit ($DATELIMIT)"
TYPE="iam-users"
sed "s/@type/$TYPE/g" "$QUERY" | sqlite3 "$SQLITEFILE" | 
jq --arg datelimit "$DATELIMIT" '
    [._AccountName, ._AccountId, ._Type, ._Team, ._Comments, (._RawObj.AccessKeys[] | select(.CreateDate < $datelimit and .Status == "Active") | .UserName, .AccessKeyId, .CreateDate, .Status) | tostring] | @csv' --raw-output | \
    grep "Active" | \
    format_report_data

message "AWS EBS Volumes that are not encrypted"
TYPE="ebs"
sed "s/@type/$TYPE/g" "$QUERY" | sqlite3 "$SQLITEFILE" | 
jq '[._AccountName, ._AccountId, ._Type, ._Id, ._Team, ._Comments, (._RawObj | select(.Encrypted == false) | .Encrypted) | tostring] | @csv' --raw-output | \
    grep "false" | \
    format_report_data

message "AWS S3 buckets without encryption"
TYPE="s3"
sed "s/@type/$TYPE/g" "$QUERY" | sqlite3 "$SQLITEFILE" | 
jq '[._AccountName, ._AccountId, ._Type, ._Id, ._Team, ._Comments, (._RawObj | .Encryption) | tostring] | @csv' --raw-output | \
    grep -v "ApplyServerSideEncryptionByDefault" | \
    format_report_data

message "AWS CloudFront without any WAF (WebACLId)"
TYPE="cloudfront"
sed "s/@type/$TYPE/g" "$QUERY" | sqlite3 "$SQLITEFILE" | 
jq '[._AccountName, ._AccountId, ._Type, ._Team, ._Comments, (._RawObj | .DomainName, .WebACLId, .Aliases.Items[]) | tostring] | @csv' --raw-output | \
    grep -v "arn:aws:wafv2" | \
    format_report_data

message "AWS SecurityGroups allowing 22 (SSH) to the world (0.0.0.0/0)"
TYPE="sg"
sed "s/@type/$TYPE/g" "$QUERY" | sqlite3 "$SQLITEFILE" | 
jq '[._AccountName, ._AccountId, ._Type, ._Id, ._Team, ._Comments, (._RawObj | .IpPermissions[] | select(.FromPort == 22) | .FromPort, .IpRanges[].CidrIp) | tostring] | @csv' --raw-output | \
    grep "0.0.0.0/0" | \
    format_report_data

message "AWS EC2 instances"
TYPE="ec2"
sed "s/@type/$TYPE/g" "$QUERY" | sqlite3 "$SQLITEFILE" | 
jq '[._AccountName, ._AccountId, ._Type, ._Id, ._Team, ._Comments, (._RawObj | .Tags[] | select(.Key == "Name") | .Value) | tostring] | @csv' --raw-output | \
    format_report_data

message "AWS ElasticBeanstalk that are not GREEN"
TYPE="elastic-beanstalk"
sed "s/@type/$TYPE/g" "$QUERY" | sqlite3 "$SQLITEFILE" | 
jq '[._AccountName, ._AccountId, ._Type, ._Id, ._Team, ._Comments, (._RawObj | .EnvironmentName, .SolutionStackName, .Health) | tostring] | @csv' --raw-output | \
    grep -v "Green" | \
    format_report_data
