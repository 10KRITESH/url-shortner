import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLink } from 'react-icons/hi';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div
                    className="navbar-logo"
                    onClick={() => navigate('/')}
                    role="button"
                    tabIndex={0}
                >
                    ✂ snip
                </div>

                <div className="navbar-links">
                    {isAuthenticated ? (
                        <>
                            <button
                                className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                                onClick={() => navigate('/')}
                            >
                                <HiOutlineLink style={{ marginRight: 4 }} />
                                Shorten
                            </button>
                            <button
                                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                                onClick={() => navigate('/dashboard')}
                            >
                                Dashboard
                            </button>
                            <div className="navbar-user">
                                <span className="navbar-email">{user?.email}</span>
                                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate('/auth')}
                        >
                            Get Started
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
