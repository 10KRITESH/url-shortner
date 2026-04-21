import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser, loginUser } from '../api';
import toast from 'react-hot-toast';

const Auth = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    if (isAuthenticated) {
        navigate('/dashboard');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const { data } = isLogin
                ? await loginUser(email.trim(), password)
                : await registerUser(email.trim(), password);

            login(data.user, data.token);
            toast.success(isLogin ? 'Welcome back!' : 'Account created!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-in">
                <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
                <p>
                    {isLogin
                        ? 'Sign in to manage your links and view analytics.'
                        : 'Sign up to start shortening URLs and tracking clicks.'}
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="auth-email">Email</label>
                        <input
                            type="email"
                            className="input"
                            id="auth-email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="auth-password">Password</label>
                        <input
                            type="password"
                            className="input"
                            id="auth-password"
                            placeholder={isLogin ? 'Enter your password' : 'Min 6 characters'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        id="auth-submit-btn"
                    >
                        {loading
                            ? (isLogin ? 'Signing in...' : 'Creating account...')
                            : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="auth-toggle">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button onClick={() => { setIsLogin(!isLogin); setEmail(''); setPassword(''); }}>
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
