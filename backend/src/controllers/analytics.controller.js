import pool from '../config/db.js';

// GET /api/analytics/:code — total clicks + clicks over time
export const getAnalytics = async (req, res) => {
    try {
        const { code } = req.params;
        const userId = req.user.id;

        // Find the URL and verify ownership
        const urlResult = await pool.query(
            'SELECT id, short_code, original_url, custom_alias, created_at FROM urls WHERE (short_code = $1 OR custom_alias = $1) AND user_id = $2',
            [code, userId]
        );

        if (urlResult.rows.length === 0) {
            return res.status(404).json({ error: 'URL not found or not owned by you.' });
        }

        const url = urlResult.rows[0];

        // Total clicks
        const totalResult = await pool.query(
            'SELECT COUNT(*)::int AS total_clicks FROM clicks WHERE url_id = $1',
            [url.id]
        );

        // Clicks over time (last 30 days, grouped by date)
        const timelineResult = await pool.query(
            `SELECT DATE(clicked_at) AS date, COUNT(*)::int AS clicks
       FROM clicks
       WHERE url_id = $1 AND clicked_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(clicked_at)
       ORDER BY date ASC`,
            [url.id]
        );

        res.json({
            url: {
                id: url.id,
                shortCode: url.short_code,
                originalUrl: url.original_url,
                customAlias: url.custom_alias,
                createdAt: url.created_at,
            },
            totalClicks: totalResult.rows[0].total_clicks,
            clicksOverTime: timelineResult.rows,
        });
    } catch (err) {
        console.error('Analytics error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// GET /api/analytics/:code/devices — device breakdown
export const getDeviceAnalytics = async (req, res) => {
    try {
        const { code } = req.params;
        const userId = req.user.id;

        const urlResult = await pool.query(
            'SELECT id FROM urls WHERE (short_code = $1 OR custom_alias = $1) AND user_id = $2',
            [code, userId]
        );

        if (urlResult.rows.length === 0) {
            return res.status(404).json({ error: 'URL not found or not owned by you.' });
        }

        const result = await pool.query(
            `SELECT device, COUNT(*)::int AS clicks
       FROM clicks
       WHERE url_id = $1
       GROUP BY device
       ORDER BY clicks DESC`,
            [urlResult.rows[0].id]
        );

        res.json({ devices: result.rows });
    } catch (err) {
        console.error('Device analytics error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// GET /api/analytics/:code/countries — country breakdown
export const getCountryAnalytics = async (req, res) => {
    try {
        const { code } = req.params;
        const userId = req.user.id;

        const urlResult = await pool.query(
            'SELECT id FROM urls WHERE (short_code = $1 OR custom_alias = $1) AND user_id = $2',
            [code, userId]
        );

        if (urlResult.rows.length === 0) {
            return res.status(404).json({ error: 'URL not found or not owned by you.' });
        }

        const result = await pool.query(
            `SELECT country, COUNT(*)::int AS clicks
       FROM clicks
       WHERE url_id = $1
       GROUP BY country
       ORDER BY clicks DESC`,
            [urlResult.rows[0].id]
        );

        res.json({ countries: result.rows });
    } catch (err) {
        console.error('Country analytics error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
