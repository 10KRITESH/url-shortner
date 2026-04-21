import { useNavigate } from 'react-router-dom';
import { HiOutlineExternalLink, HiOutlineTrash, HiOutlineClipboardCopy, HiOutlineChartBar } from 'react-icons/hi';
import { deleteUrl } from '../api';
import toast from 'react-hot-toast';

const LinkCard = ({ url, onDelete }) => {
    const navigate = useNavigate();
    const shortUrl = `${window.location.origin}/${url.short_code}`;
    const displayUrl = shortUrl.replace(/^https?:\/\//, '');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            toast.success('Copied to clipboard!');
        } catch {
            toast.error('Failed to copy');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this link?')) return;

        try {
            await deleteUrl(url.short_code);
            toast.success('Link deleted');
            onDelete(url.id);
        } catch {
            toast.error('Failed to delete link');
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="link-card animate-in">
            <div className="link-card-icon">
                <HiOutlineExternalLink />
            </div>

            <div className="link-card-info">
                <div className="link-card-short">{displayUrl}</div>
                <div className="link-card-original" title={url.original_url}>
                    {url.original_url}
                </div>
            </div>

            <div className="link-card-meta">
                <div className="link-card-clicks">
                    <HiOutlineChartBar />
                    {url.total_clicks || 0} clicks
                </div>
                <div className="link-card-date">{formatDate(url.created_at)}</div>
            </div>

            <div className="link-card-actions">
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleCopy}
                    title="Copy short URL"
                >
                    <HiOutlineClipboardCopy />
                </button>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/analytics/${url.short_code}`)}
                    title="View analytics"
                >
                    <HiOutlineChartBar />
                </button>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleDelete}
                    title="Delete link"
                    style={{ color: 'var(--accent-red)' }}
                >
                    <HiOutlineTrash />
                </button>
            </div>
        </div>
    );
};

export default LinkCard;
