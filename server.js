const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// ── Supabase Config ──
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kpreqhajfeqlmiwahxli.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcmVxaGFqZmVxbG1pd2FoeGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTUxMzAsImV4cCI6MjA4NzY5MTEzMH0.sPOz06fad0h4kJeKpn8jrkdI13VytFbMJiJ6dT29hRw';

const supabaseHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
};

// ── API Key for admin endpoints ──
const API_KEY = 'portfolio-admin-2026';

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
app.use(express.static(path.join(__dirname)));

// ── API: Submit a contact message ──
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
            method: 'POST',
            headers: { ...supabaseHeaders, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ name, email, subject, message })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Supabase error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        console.log(`New message from ${name} <${email}>`);
        res.json({ success: true, message: `Thank you, ${name}! Your message has been saved.` });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

// ── API: Get all messages (admin) — protected ──
app.get('/api/messages', requireApiKey, async (req, res) => {
    // Handle delete via query param (for Vercel compatibility)
    if (req.query.delete) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${req.query.delete}`, {
                method: 'DELETE',
                headers: supabaseHeaders
            });
            if (!response.ok) {
                return res.status(500).json({ success: false, message: 'Failed to delete.' });
            }
            return res.json({ success: true, message: 'Message deleted.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Server error.' });
        }
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?order=created_at.desc&select=*`, {
            method: 'GET',
            headers: supabaseHeaders
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Supabase error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        const messages = await response.json();
        res.json({ success: true, count: messages.length, messages });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── API: Delete a message by ID — protected ──
app.delete('/api/messages/:id', requireApiKey, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${req.params.id}`, {
            method: 'DELETE',
            headers: supabaseHeaders
        });

        if (!response.ok) {
            return res.status(500).json({ success: false, message: 'Failed to delete.' });
        }

        res.json({ success: true, message: 'Message deleted.' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── Start Server ──
app.listen(PORT, () => {
    console.log('============================================');
    console.log('  Portfolio Server is running!');
    console.log(`  Open http://localhost:${PORT} in your browser`);
    console.log('  Database: Supabase (cloud)');
    console.log('  API Key: ' + API_KEY);
    console.log('============================================');
});
