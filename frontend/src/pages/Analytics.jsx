import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, getDeviceAnalytics, getCountryAnalytics } from '../api';
import { ClicksOverTimeChart, DeviceChart, CountryChart } from '../components/StatsChart';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const Analytics = () => {
    const { code } = useParams();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState(null);
    const [devices, setDevices] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        fetchAllData();
    }, [code, isAuthenticated]);

    const fetchAllData = async () => {
        try {
            const [analyticsRes, devicesRes, countriesRes] = await Promise.all([
                getAnalytics(code),
                getDeviceAnalytics(code),
                getCountryAnalytics(code),
            ]);

            setAnalytics(analyticsRes.data);
            setDevices(devicesRes.data.devices);
            setCountries(countriesRes.data.countries);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="spinner" />;

    if (!analytics) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <h3>URL not found</h3>
                        <p>This link doesn't exist or doesn't belong to you.</p>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/dashboard')}>
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="analytics-header animate-in">
                    <button
                        className="btn btn-ghost"
                        onClick={() => navigate('/dashboard')}
                        style={{ marginBottom: 16 }}
                    >
                        <HiOutlineArrowLeft />
                        Back to Dashboard
                    </button>
                    <h1>Analytics for /{analytics.url.shortCode}</h1>
                    <div className="analytics-header-url">{analytics.url.originalUrl}</div>
                </div>

                {/* Total Clicks */}
                <div className="dashboard-stats animate-in">
                    <div className="stat-card">
                        <div className="stat-card-label">Total Clicks</div>
                        <div className="stat-card-value">{analytics.totalClicks}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-label">Devices Tracked</div>
                        <div className="stat-card-value">{devices.length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-label">Countries Reached</div>
                        <div className="stat-card-value">{countries.length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-label">Created</div>
                        <div className="stat-card-value" style={{ fontSize: '1rem' }}>
                            {new Date(analytics.url.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="analytics-grid animate-in">
                    <div className="analytics-chart-card full-width">
                        <div className="analytics-chart-title">📈 Clicks Over Time (Last 30 Days)</div>
                        <ClicksOverTimeChart data={analytics.clicksOverTime} />
                    </div>

                    <div className="analytics-chart-card">
                        <div className="analytics-chart-title">📱 Device Breakdown</div>
                        <DeviceChart data={devices} />
                    </div>

                    <div className="analytics-chart-card">
                        <div className="analytics-chart-title">🌍 Top Countries</div>
                        <CountryChart data={countries} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
