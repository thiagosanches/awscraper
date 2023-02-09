#!/bin/bash

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
	cat $0 | grep "$HELP_TOKEN" | sed "s/$HELP_TOKEN//g" | grep -v "HELP_TOKEN"
}

function message() {
    echo -e "${GREEN}=============================================${NOCOLOR}"
    echo -e "${GREEN}$1.${NOCOLOR}"
    echo -e "${GREEN}=============================================${NOCOLOR}"
}

if [[ $# -ne 1 ]]
then
	help; exit -1
fi

message "AWS AccessKeys that are under the date limit"
TYPE="iam-users"
DATELIMIT=$(date -d -90days +%Y-%m-%d)
sed "s/@type/$TYPE/g" $QUERY | sqlite3 $SQLITEFILE | 
jq --arg datelimit "$DATELIMIT" '
    [._AccountName, ._AccountId, ._Team, ._Comments, (._RawObj.AccessKeys[] | select(.CreateDate < $datelimit and .Status == "Active") | .UserName, .AccessKeyId, .CreateDate, .Status) | tostring] | @csv' --raw-output | \
    grep "Active" | \
    sort -u | \
    column -t -s','

message "AWS EBS Volumes that are not encrypted"
TYPE="ebs"
DATELIMIT=$(date -d -90days +%Y-%m-%d)
sed "s/@type/$TYPE/g" $QUERY | sqlite3 $SQLITEFILE | 
jq --arg datelimit "$DATELIMIT" ' 
    [._AccountName, ._AccountId, ._Team, ._Comments, (._RawObj | select(.Encrypted == false) | .Encrypted, .VolumeId) | tostring] | @csv' --raw-output | \
    grep "false" | \
    sort -u | \
    column -t -s','

message "AWS S3 buckets without encryption"
TYPE="s3"
DATELIMIT=$(date -d -90days +%Y-%m-%d)
sed "s/@type/$TYPE/g" $QUERY | sqlite3 $SQLITEFILE | 
jq --arg datelimit "$DATELIMIT" ' 
    [._Id, ._AccountName, ._AccountId, ._Team, ._Comments, (._RawObj | .Encryption) | tostring] | @csv' --raw-output | \
    grep -v "ApplyServerSideEncryptionByDefault" | \
    sort -u | \
    column -t -s','

message "AWS CloudFront without any WAF (WebACLId)"
TYPE="cloudfront"
DATELIMIT=$(date -d -90days +%Y-%m-%d)
sed "s/@type/$TYPE/g" $QUERY | sqlite3 $SQLITEFILE | 
jq --arg datelimit "$DATELIMIT" ' 
    [._AccountName, ._AccountId, ._Team, ._Comments, (._RawObj | .DomainName, .WebACLId, .Aliases.Items[]) | tostring] | @csv' --raw-output | \
    grep -v "arn:aws:wafv2" | \
    sort -u | \
    column -t -s','
