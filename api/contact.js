const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kpreqhajfeqlmiwahxli.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcmVxaGFqZmVxbG1pd2FoeGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTUxMzAsImV4cCI6MjA4NzY5MTEzMH0.sPOz06fad0h4kJeKpn8jrkdI13VytFbMJiJ6dT29hRw';

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }

    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ name, email, subject, message })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Supabase error:', err);
            return res.status(500).json({ success: false, message: 'Database error. Please try again later.' });
        }

        return res.status(200).json({
            success: true,
            message: `Thank you, ${name}! Your message has been saved.`
        });
    } catch (err) {
        console.error('Server error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};
