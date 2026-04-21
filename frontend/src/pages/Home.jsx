import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { shortenUrl } from '../api';
import toast from 'react-hot-toast';
import { HiOutlineClipboardCopy, HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineShieldCheck } from 'react-icons/hi';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [originalUrl, setOriginalUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleShorten = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        if (!originalUrl.trim()) {
            toast.error('Please enter a URL');
            return;
        }

        setLoading(true);
        try {
            const { data } = await shortenUrl(
                originalUrl.trim(),
                customAlias.trim() || undefined,
                expiresAt || undefined
            );
            setResult(data.url);
            setOriginalUrl('');
            setCustomAlias('');
            setExpiresAt('');
            toast.success('URL shortened!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to shorten URL');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result.shortUrl);
            toast.success('Copied to clipboard!');
        } catch {
            toast.error('Failed to copy');
        }
    };

    return (
        <div className="page">
            <div className="container">
                {/* Hero */}
                <div className="hero">
                    <div className="hero-badge">
                        <HiOutlineLightningBolt />
                        Fast, free & open source
                    </div>

                    <h1>
                        Shorten your links,<br />
                        <span className="gradient-text">amplify your reach</span>
                    </h1>

                    <p>
                        Create short, memorable URLs in seconds. Track every click with
                        powerful analytics — devices, countries, and trends at your fingertips.
                    </p>

                    {/* Shortener Form */}
                    <form className="shortener-form" onSubmit={handleShorten}>
                        <div className="shortener-input-row">
                            <input
                                type="url"
                                className="input input-large"
                                placeholder="Paste your long URL here..."
                                value={originalUrl}
                                onChange={(e) => setOriginalUrl(e.target.value)}
                                required
                                id="url-input"
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                                id="shorten-btn"
                            >
                                {loading ? 'Shortening...' : 'Shorten'}
                            </button>
                        </div>

                        <div className="shortener-options">
                            <div className="input-group">
                                <label className="input-label" htmlFor="custom-alias">Custom alias (optional)</label>
                                <input
                                    type="text"
                                    className="input"
                                    id="custom-alias"
                                    placeholder="my-custom-link"
                                    value={customAlias}
                                    onChange={(e) => setCustomAlias(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label" htmlFor="expires-at">Expiration date (optional)</label>
                                <input
                                    type="datetime-local"
                                    className="input"
                                    id="expires-at"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                />
                            </div>
                        </div>
                    </form>

                    {/* Result */}
                    {result && (
                        <div className="shortener-result animate-in">
                            <div className="shortener-result-url">
                                <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                                    {result.shortUrl.replace(/^https?:\/\//, '')}
                                </a>
                                <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                                    <HiOutlineClipboardCopy />
                                    Copy
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Features */}
                <div className="dashboard-stats" style={{ marginTop: 60 }}>
                    <div className="stat-card animate-in">
                        <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>⚡</div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>Lightning Fast</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            URLs are shortened in milliseconds. Redirects happen instantly with 302 responses.
                        </p>
                    </div>
                    <div className="stat-card animate-in">
                        <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>📊</div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>Rich Analytics</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Track clicks, devices, browsers, and countries. Know exactly who's clicking your links.
                        </p>
                    </div>
                    <div className="stat-card animate-in">
                        <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>🔒</div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>Secure by Design</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            JWT authentication, rate limiting, and expiring links. Your data stays safe.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
