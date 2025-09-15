import type { PropsWithChildren } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

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
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-600">Please log in to access this page.</div>
            </div>
        );
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-600">Access denied. Insufficient permissions.</div>
            </div>
        );
    }

    return <>{children}</>;
}