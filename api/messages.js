const initSqlJs = require('sql.js');
const fs = require('fs');

const DB_PATH = '/tmp/portfolio.db';
const API_KEY = 'portfolio-admin-2026';

async function getDB() {
    const SQL = await initSqlJs();
    let db;
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
        db.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
    return db;
}

function saveDB(db) {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

    if (req.method === 'OPTIONS') return res.status(204).end();

    // Check API key
    const key = req.headers['x-api-key'] || req.query.key;
    if (key !== API_KEY) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Invalid API key.' });
    }

    try {
        const db = await getDB();

        // DELETE /api/messages?id=1
        if (req.method === 'DELETE' || req.query.delete) {
            const id = req.query.id || req.query.delete;
            if (id) {
                db.run('DELETE FROM messages WHERE id = ?', [id]);
                saveDB(db);
                db.close();
                return res.status(200).json({ success: true, message: 'Message deleted.' });
            }
        }

        // GET /api/messages
        if (req.method === 'GET') {
            const result = db.exec('SELECT * FROM messages ORDER BY created_at DESC');
            let messages = [];
            if (result.length > 0) {
                const columns = result[0].columns;
                messages = result[0].values.map(row => {
                    const obj = {};
                    columns.forEach((col, i) => obj[col] = row[i]);
                    return obj;
                });
            }
            db.close();
            return res.status(200).json({ success: true, count: messages.length, messages });
        }

        db.close();
        return res.status(405).json({ success: false, message: 'Method not allowed.' });

    } catch (err) {
        console.error('DB error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};
