import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fb923c', '#f472b6', '#f87171', '#fbbf24'];

// Custom tooltip styling
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div style={{
            background: 'rgba(18, 18, 26, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '0.85rem',
            color: '#f0f0f5',
            backdropFilter: 'blur(8px)',
        }}>
            <p style={{ color: '#8888a0', marginBottom: 4 }}>{label}</p>
            {payload.map((entry, index) => (
                <p key={index} style={{ color: entry.color, fontWeight: 600 }}>
                    {entry.name}: {entry.value}
                </p>
            ))}
        </div>
    );
};

// ─── Clicks Over Time (Area Chart) ──────────────────────
export const ClicksOverTimeChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="empty-state" style={{ padding: 40 }}><p>No click data yet</p></div>;
    }

    const formatted = data.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        clicks: d.clicks,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formatted}>
                <defs>
                    <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#55556a" fontSize={12} />
                <YAxis stroke="#55556a" fontSize={12} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    fill="url(#clickGradient)"
                    name="Clicks"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// ─── Device Breakdown (Pie Chart) ───────────────────────
export const DeviceChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="empty-state" style={{ padding: 40 }}><p>No device data yet</p></div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="clicks"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={4}
                    label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    style={{ fontSize: '0.8rem' }}
                >
                    {data.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    formatter={(value) => <span style={{ color: '#8888a0', fontSize: '0.8rem' }}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

// ─── Country Breakdown (Bar Chart) ──────────────────────
export const CountryChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="empty-state" style={{ padding: 40 }}><p>No country data yet</p></div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#55556a" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="country" type="category" stroke="#55556a" fontSize={12} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="clicks" name="Clicks" radius={[0, 4, 4, 0]}>
                    {data.slice(0, 10).map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};
