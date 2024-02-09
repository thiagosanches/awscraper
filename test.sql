CREATE TABLE IF NOT EXISTS artifact (
    Id              INTEGER NOT NULL,
    ParentId        INTEGER,
    TypeId          INTEGER NOT NULL,
    Identifier      TEXT NOT NULL,
    Removed         INTEGER NOT NULL,
    LastFetchTime   TEXT NOT NULL,
    PRIMARY KEY (
        Id AUTOINCREMENT
    ),
    FOREIGN KEY ( 
        ParentId
    ) REFERENCES artifact(Id)
);





DELETE FROM artifact;
UPDATE `sqlite_sequence` SET `seq` = 0 WHERE `name` = 'artifact';
INSERT INTO artifact (TypeId, Identifier, Removed, LastFetchTime) VALUES (1, 'xyz-project-one', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (1, 2, 'lambda1', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (1, 2, 'lambda2', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (1, 2, 'lambda3', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (1, 2, 'lambda4', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (1, 2, 'lambda5', 'false', CURRENT_TIMESTAMP);

INSERT INTO artifact (TypeId, Identifier, Removed, LastFetchTime) VALUES (1, 'xyz-project-two', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (7, 1, 'lambdaA', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (7, 1, 'lambdaB', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (7, 1, 'lambdaX', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (7, 1, 'lambdaY', 'false', CURRENT_TIMESTAMP);
        INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (11, 1, 'lambdaY', 'false', CURRENT_TIMESTAMP);
            INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (23, 1, 'athena', 'false', CURRENT_TIMESTAMP);
            INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (23, 1, 'rds', 'false', CURRENT_TIMESTAMP);
            INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (23, 1, 'sqs', 'false', CURRENT_TIMESTAMP);
            INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (23, 1, 'sns', 'false', CURRENT_TIMESTAMP);
            INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (23, 1, 's3', 'false', CURRENT_TIMESTAMP);

INSERT INTO artifact (TypeId, Identifier, Removed, LastFetchTime) VALUES (1, 'xyz-project-three', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (12, 1, 'lambda01', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (12, 1, 'lambda02', 'false', CURRENT_TIMESTAMP);

INSERT INTO artifact (TypeId, Identifier, Removed, LastFetchTime) VALUES (1, 'xyz-project-four', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (15, 1, 'lambda00001', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (15, 1, 'lambda00002', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (15, 1, 'lambda00003', 'false', CURRENT_TIMESTAMP);

INSERT INTO artifact (TypeId, Identifier, Removed, LastFetchTime) VALUES (1, 'xyz-project-five', 'false', CURRENT_TIMESTAMP);
    INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (19, 1, 'lambda0', 'false', CURRENT_TIMESTAMP);
        INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (20, 1, 'athena', 'false', CURRENT_TIMESTAMP);
            INSERT INTO artifact (ParentId, TypeId, Identifier, Removed, LastFetchTime) VALUES (21, 1, 'glue', 'false', CURRENT_TIMESTAMP);


WITH RECURSIVE artifact_hierarchy AS (
    SELECT ParentId, Id, Identifier
    FROM artifact
    WHERE ParentId IS NULL
    
    UNION ALL
    
    SELECT a.ParentId, a.Id, a.Identifier
    FROM artifact a
    JOIN artifact_hierarchy ah ON a.ParentId = ah.Id
) SELECT * FROM artifact_hierarchy;

WITH RECURSIVE ArtifactHierarchy AS (
    SELECT * 
    FROM artifact
    WHERE Identifier = 'your_desired_identifier'
    
    UNION ALL
    
    SELECT a.*
    FROM artifact a
    JOIN ArtifactHierarchy ah ON a.Id = ah.ParentId
)
SELECT * FROM ArtifactHierarchy;
