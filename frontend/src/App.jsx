import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Auth from './pages/Auth';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analytics/:code" element={<Analytics />} />
                    <Route path="/auth" element={<Auth />} />
                </Routes>

                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1a1a2e',
                            color: '#f0f0f5',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            fontSize: '0.875rem',
                            fontFamily: 'Inter, sans-serif',
                        },
                        success: {
                            iconTheme: { primary: '#34d399', secondary: '#0a0a0f' },
                        },
                        error: {
                            iconTheme: { primary: '#f87171', secondary: '#0a0a0f' },
                        },
                    }}
                />
            </Router>
        </AuthProvider>
    );
};

export default App;
