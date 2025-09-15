import type { PropsWithChildren } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { Link } from 'react-router-dom';
import LogOutButton from './LogOutButton';

type ProtectedRouteProps = PropsWithChildren & {
    allowedRoles?: UserRole[];
};
export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const { currentUser, loading } = useAuth();


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center min-h-screen gap-y-4 flex-col">
                <div className="text-xl text-white">Please log in to access this page.</div>
                <div className="space-y-4">
                    <Link
                        to="/login"
                        className="block w-full bg-accent-bg text-accent-text py-3 px-6 rounded-md font-semibold hover:bg-accent-hover transition-colors"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (currentUser.mustChangePassword) {
        return (
            <div className="flex justify-center items-center min-h-screen flex-col gap-y-4">
                <div className="text-xl text-white">
                    You must change your password before accessing this page.
                </div>
                <div className="space-y-4">
                    <Link
                        to="/change-password"
                        className="block w-full bg-accent-bg text-accent-text py-3 px-6 rounded-md font-semibold hover:bg-accent-hover transition-colors"
                    >
                        Change Password
                    </Link>
                    <LogOutButton />
                </div>
            </div>
        );
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-white">Access denied. Insufficient permissions.</div>
            </div>
        );
    }

    return <>{children}</>;
}
