import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserUrls } from '../api';
import LinkCard from '../components/LinkCard';
import { HiOutlinePlus } from 'react-icons/hi';

const Dashboard = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        fetchUrls();
    }, [isAuthenticated]);

    const fetchUrls = async () => {
        try {
            const { data } = await getUserUrls();
            setUrls(data.urls);
        } catch (err) {
            console.error('Failed to fetch URLs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (deletedId) => {
        setUrls(urls.filter(u => u.id !== deletedId));
    };

    const totalClicks = urls.reduce((sum, u) => sum + (u.total_clicks || 0), 0);

    if (loading) return <div className="spinner" />;

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header animate-in">
                    <div>
                        <h1>Your Links</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                            Manage and track all your shortened URLs
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        <HiOutlinePlus />
                        New Link
                    </button>
                </div>

                {/* Stats */}
                <div className="dashboard-stats animate-in">
                    <div className="stat-card">
                        <div className="stat-card-label">Total Links</div>
                        <div className="stat-card-value">{urls.length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-label">Total Clicks</div>
                        <div className="stat-card-value">{totalClicks}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-label">Avg Clicks / Link</div>
                        <div className="stat-card-value">
                            {urls.length > 0 ? (totalClicks / urls.length).toFixed(1) : '0'}
                        </div>
                    </div>
                </div>

                {/* Links List */}
                {urls.length === 0 ? (
                    <div className="empty-state animate-in">
                        <div className="empty-state-icon">🔗</div>
                        <h3>No links yet</h3>
                        <p>Create your first shortened URL to get started!</p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 20 }}
                            onClick={() => navigate('/')}
                        >
                            <HiOutlinePlus />
                            Create Link
                        </button>
                    </div>
                ) : (
                    <div className="links-list stagger-in">
                        {urls.map((url) => (
                            <LinkCard key={url.id} url={url} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
