const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection and helpers
const dbPath = path.join(__dirname, 'database.db');
let db;

// Helper functions to promisify database queries
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
    });
});

// Initialize database
async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, async (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
            } else {
                console.log('Connected to SQLite database at', dbPath);
                try {
                    await dbRun(`CREATE TABLE IF NOT EXISTS "resources" (
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
                    )`);
                    console.log('Database schema initialized');
                    resolve();
                } catch (tableErr) {
                    console.error('Error creating table:', tableErr.message);
                    reject(tableErr);
                }
            }
        });
    });
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all resources with optional filters
app.get('/api/resources', async (req, res) => {
    try {
        const {
            type, region, status, accountId, team, search,
        } = req.query;

        let sql = 'SELECT * FROM resources WHERE 1=1';
        const params = [];

        if (type && type !== 'all') {
            sql += ' AND Type = ?';
            params.push(type);
        }

        if (region && region !== 'all') {
            sql += ' AND Region = ?';
            params.push(region);
        }

        if (status && status !== 'all') {
            sql += ' AND Status = ?';
            params.push(status);
        }

        if (accountId) {
            sql += ' AND AccountId = ?';
            params.push(accountId);
        }

        if (team && team !== 'all') {
            sql += ' AND Team = ?';
            params.push(team);
        }

        if (search) {
            sql += ' AND (Id LIKE ? OR Comments LIKE ? OR AccountName LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        sql += ' ORDER BY LastModified DESC';

        const resources = await dbAll(sql, params);
        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: 'Failed to fetch resources', message: error.message });
    }
});

// Get resource by ID
app.get('/api/resources/:id', async (req, res) => {
    try {
        const resource = await dbGet('SELECT * FROM resources WHERE Id = ?', [req.params.id]);

        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        res.json(resource);
    } catch (error) {
        console.error('Error fetching resource:', error);
        res.status(500).json({ error: 'Failed to fetch resource', message: error.message });
    }
});

// Update resource metadata (Team and Comments only)
app.put('/api/resources/:id', async (req, res) => {
    try {
        const { Team, Comments } = req.body;
        const { id } = req.params;

        // First check if resource exists
        const existing = await dbGet('SELECT Id FROM resources WHERE Id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        // Update only Team and Comments
        const sql = `
            UPDATE resources 
            SET Team = ?, 
                Comments = ?,
                LastModified = CURRENT_TIMESTAMP 
            WHERE Id = ?
        `;

        await dbRun(sql, [Team || null, Comments || null, id]);

        // Return updated resource
        const updated = await dbGet('SELECT * FROM resources WHERE Id = ?', [id]);
        res.json(updated);
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ error: 'Failed to update resource', message: error.message });
    }
});

// Get dashboard statistics
app.get('/api/stats', async (req, res) => {
    try {
        const [
            totalCount,
            statusCounts,
            typeCounts,
            regionCounts,
            teamCounts,
            recentResources,
        ] = await Promise.all([
            // Total resources
            dbGet('SELECT COUNT(*) as count FROM resources WHERE Status = "LIVE"'),

            // Status breakdown
            dbAll('SELECT Status, COUNT(*) as count FROM resources GROUP BY Status'),

            // Type breakdown
            dbAll('SELECT Type, COUNT(*) as count FROM resources WHERE Status = "LIVE" GROUP BY Type ORDER BY count DESC LIMIT 10'),

            // Region breakdown
            dbAll('SELECT Region, COUNT(*) as count FROM resources WHERE Status = "LIVE" GROUP BY Region ORDER BY count DESC LIMIT 10'),

            // Team breakdown
            dbAll('SELECT Team, COUNT(*) as count FROM resources WHERE Status = "LIVE" AND Team IS NOT NULL GROUP BY Team ORDER BY count DESC'),

            // Recent activity
            dbAll('SELECT * FROM resources ORDER BY LastModified DESC LIMIT 10'),
        ]);

        res.json({
            total: totalCount.count,
            byStatus: statusCounts.reduce((acc, row) => {
                acc[row.Status] = row.count;
                return acc;
            }, {}),
            byType: typeCounts,
            byRegion: regionCounts,
            byTeam: teamCounts,
            recent: recentResources,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
    }
});

// Get unique values for filters
app.get('/api/filters', async (req, res) => {
    try {
        const [types, regions, teams, accounts] = await Promise.all([
            dbAll('SELECT DISTINCT Type FROM resources WHERE Status = "LIVE" ORDER BY Type'),
            dbAll('SELECT DISTINCT Region FROM resources WHERE Status = "LIVE" ORDER BY Region'),
            dbAll('SELECT DISTINCT Team FROM resources WHERE Team IS NOT NULL ORDER BY Team'),
            dbAll('SELECT DISTINCT AccountId, AccountName FROM resources ORDER BY AccountName'),
        ]);

        res.json({
            types: types.map((r) => r.Type),
            regions: regions.map((r) => r.Region),
            teams: teams.map((r) => r.Team),
            accounts: accounts.map((r) => ({ id: r.AccountId, name: r.AccountName })),
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ error: 'Failed to fetch filter options', message: error.message });
    }
});

// Get account list
app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await dbAll(`
            SELECT 
                AccountId, 
                AccountName, 
                COUNT(*) as resourceCount,
                SUM(CASE WHEN Status = 'LIVE' THEN 1 ELSE 0 END) as liveCount,
                SUM(CASE WHEN Status = 'DELETED' THEN 1 ELSE 0 END) as deletedCount
            FROM resources 
            GROUP BY AccountId, AccountName 
            ORDER BY AccountName
        `);

        res.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Failed to fetch accounts', message: error.message });
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nClosing database connection...');
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// Start server
async function startServer() {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`🚀 AWScraper API Server running on http://localhost:${PORT}`);
            console.log(`   Health check: http://localhost:${PORT}/api/health`);
            console.log(`   Resources: http://localhost:${PORT}/api/resources`);
            console.log(`   Stats: http://localhost:${PORT}/api/stats`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
