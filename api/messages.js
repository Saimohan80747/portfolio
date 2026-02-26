const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kpreqhajfeqlmiwahxli.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcmVxaGFqZmVxbG1pd2FoeGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTUxMzAsImV4cCI6MjA4NzY5MTEzMH0.sPOz06fad0h4kJeKpn8jrkdI13VytFbMJiJ6dT29hRw';
const API_KEY = 'portfolio-admin-2026';

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

    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
    };

    try {
        // DELETE /api/messages?delete=1
        if (req.method === 'DELETE' || req.query.delete) {
            const id = req.query.id || req.query.delete;
            if (id) {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${id}`, {
                    method: 'DELETE',
                    headers
                });
                if (!response.ok) {
                    const err = await response.text();
                    console.error('Supabase delete error:', err);
                    return res.status(500).json({ success: false, message: 'Failed to delete.' });
                }
                return res.status(200).json({ success: true, message: 'Message deleted.' });
            }
        }

        // GET /api/messages
        if (req.method === 'GET' && !req.query.delete) {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?order=created_at.desc&select=*`, {
                method: 'GET',
                headers
            });
            if (!response.ok) {
                const err = await response.text();
                console.error('Supabase fetch error:', err);
                return res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
            }
            const messages = await response.json();
            return res.status(200).json({ success: true, count: messages.length, messages });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed.' });

    } catch (err) {
        console.error('Server error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};
