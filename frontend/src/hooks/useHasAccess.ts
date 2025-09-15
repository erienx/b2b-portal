import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

export function useHasAccess(allowedRoles?: UserRole[]): boolean {
    const { currentUser } = useAuth();

    if (!currentUser) return false;
    if (!allowedRoles) return true;

    return allowedRoles.includes(currentUser.role);
}