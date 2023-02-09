SELECT json_object("_Id", Id, "_AccountName", AccountName, "_AccountId", AccountId, "_Team", Team, "_Comments", Comments, "_RawObj", json(RawObj)) 
FROM resources WHERE type = '@type'
