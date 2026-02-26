const express = require('express');
const initSqlJs = require('sql.js');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'portfolio.db');

// ── API Key for admin endpoints ──
const API_KEY = 'portfolio-admin-2026';

// Middleware to check API key
function requireApiKey(req, res, next) {
    const key = req.headers['x-api-key'] || req.query.key;
    if (key !== API_KEY) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Invalid API key.' });
    }
    next();
}

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html, styles.css, script.js)
app.use(express.static(path.join(__dirname)));

let db;

// ── Initialize Database ──
async function initDB() {
    const SQL = await initSqlJs();

    // Load existing database file or create new one
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // Create the messages table if it doesn't exist
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

    saveDB();
    console.log('Database ready — "messages" table created.');
}

// Save database to file
function saveDB() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// ── API: Submit a contact message ──
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validate
    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required.'
        });
    }

    try {
        db.run(
            'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        saveDB();

        console.log(`New message from ${name} <${email}>`);

        res.json({
            success: true,
            message: `Thank you, ${name}! Your message has been saved.`
        });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// ── API: Get all messages (admin view) — protected ──
app.get('/api/messages', requireApiKey, (req, res) => {
    try {
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

        res.json({ success: true, count: messages.length, messages });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── API: Delete a message by ID — protected ──
app.delete('/api/messages/:id', requireApiKey, (req, res) => {
    try {
        db.run('DELETE FROM messages WHERE id = ?', [req.params.id]);
        saveDB();

        res.json({ success: true, message: 'Message deleted.' });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── Start Server ──
initDB().then(() => {
    app.listen(PORT, () => {
        console.log('============================================');
        console.log('  Portfolio Server is running!');
        console.log(`  Open http://localhost:${PORT} in your browser`);
        console.log('  Database file: portfolio.db');
        console.log('  API Key: ' + API_KEY);
        console.log('============================================');
    });
});

// Save database on exit
process.on('SIGINT', () => {
    if (db) saveDB();
    console.log('\nDatabase closed. Server stopped.');
    process.exit();
});
