import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Welcome, {currentUser.first_name}!
                    </h1>
                    <p className="text-grey mb-6">You are already logged in.</p>
                    <Link
                        to="/dashboard"
                        className="inline-block bg-accent-bg text-accent-text py-3 px-6 rounded-md font-semibold hover:bg-accent-hover transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg">
            <div className="bg-surface p-8 rounded-2xl shadow-lg text-center max-w-md w-full mx-4">
                <h1 className="text-4xl font-bold text-white mb-2">Welcome</h1>
                <p className="text-grey mb-8">Please log in to continue</p>

                <div className="space-y-4">
                    <Link
                        to="/login"
                        className="block w-full bg-accent-bg text-accent-text py-3 px-6 rounded-md font-semibold hover:bg-accent-hover transition-colors"
                    >
                        Login
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-surfaceLight">
                    <p className="text-grey text-sm">
                        New to our platform? Ask a system administrator to create an account for you.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;