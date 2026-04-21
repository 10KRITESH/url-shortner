import pool from '../config/db.js';
import generateCode from '../utils/generateCode.js';
import { parseUserAgent } from '../utils/parseUserAgent.js';
import geoip from 'geoip-lite';

// POST /api/urls/shorten — create a short URL
export const shortenUrl = async (req, res) => {
    try {
        const { originalUrl, customAlias, expiresAt } = req.body;
        const userId = req.user.id;

        if (!originalUrl) {
            return res.status(400).json({ error: 'originalUrl is required.' });
        }

        // Validate URL format
        try {
            new URL(originalUrl);
        } catch {
            return res.status(400).json({ error: 'Invalid URL format.' });
        }

        let shortCode;

        // If custom alias provided, check availability
        if (customAlias) {
            if (customAlias.length < 3 || customAlias.length > 50) {
                return res.status(400).json({ error: 'Custom alias must be 3-50 characters.' });
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
                return res.status(400).json({ error: 'Custom alias can only contain letters, numbers, hyphens, and underscores.' });
            }

            const existing = await pool.query(
                'SELECT id FROM urls WHERE custom_alias = $1 OR short_code = $1',
                [customAlias]
            );
            if (existing.rows.length > 0) {
                return res.status(409).json({ error: 'This alias is already taken.' });
            }

            shortCode = customAlias;
        } else {
            // Generate unique short code
            let isUnique = false;
            while (!isUnique) {
                shortCode = generateCode();
                const existing = await pool.query('SELECT id FROM urls WHERE short_code = $1', [shortCode]);
                if (existing.rows.length === 0) isUnique = true;
            }
        }

        // Insert URL
        const result = await pool.query(
            `INSERT INTO urls (user_id, short_code, original_url, custom_alias, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, short_code, original_url, custom_alias, expires_at, created_at`,
            [userId, shortCode, originalUrl, customAlias || null, expiresAt || null]
        );

        const url = result.rows[0];

        res.status(201).json({
            message: 'URL shortened successfully.',
            url: {
                id: url.id,
                shortCode: url.short_code,
                shortUrl: `${process.env.BASE_URL || `${req.protocol}://${req.get('host')}`}/${url.short_code}`,
                originalUrl: url.original_url,
                customAlias: url.custom_alias,
                expiresAt: url.expires_at,
                createdAt: url.created_at,
            },
        });
    } catch (err) {
        console.error('Shorten URL error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// GET /api/urls — get all URLs for logged in user
export const getUserUrls = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT u.id, u.short_code, u.original_url, u.custom_alias, u.expires_at, u.created_at,
              COUNT(c.id)::int AS total_clicks
       FROM urls u
       LEFT JOIN clicks c ON c.url_id = u.id
       WHERE u.user_id = $1
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
            [userId]
        );

        res.json({ urls: result.rows });
    } catch (err) {
        console.error('Get URLs error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// DELETE /api/urls/:code — delete a URL
export const deleteUrl = async (req, res) => {
    try {
        const { code } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'DELETE FROM urls WHERE (short_code = $1 OR custom_alias = $1) AND user_id = $2 RETURNING id',
            [code, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'URL not found or not owned by you.' });
        }

        res.json({ message: 'URL deleted successfully.' });
    } catch (err) {
        console.error('Delete URL error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// GET /:code — redirect to original URL + log click
export const redirectUrl = async (req, res) => {
    try {
        const { code } = req.params;

        const result = await pool.query(
            'SELECT id, original_url, expires_at FROM urls WHERE short_code = $1 OR custom_alias = $1',
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Short URL not found.' });
        }

        const url = result.rows[0];

        // Check expiry
        if (url.expires_at && new Date(url.expires_at) < new Date()) {
            return res.status(410).json({ error: 'This link has expired.' });
        }

        // Log click asynchronously — don't make the user wait
        const userAgent = req.headers['user-agent'] || '';
        const { device, browser } = parseUserAgent(userAgent);

        // Get IP address
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';

        // Geo lookup
        const geo = geoip.lookup(ip);
        const country = geo?.country || 'Unknown';

        // Fire and forget — async click logging
        pool.query(
            `INSERT INTO clicks (url_id, country, device, browser, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
            [url.id, country, device, browser, ip]
        ).catch(err => console.error('Click log error:', err.message));

        // 302 redirect
        res.redirect(302, url.original_url);
    } catch (err) {
        console.error('Redirect error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
