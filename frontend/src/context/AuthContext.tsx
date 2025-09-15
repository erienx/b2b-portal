import { createContext, useContext } from 'react';
import type { User } from '../types/auth';

type AuthContext = {
    authToken?: string | null;
    currentUser?: User | null;
    handleLogin: (email: string, password: string) => Promise<void>;
    handleLogout: () => Promise<void>;
    handleChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    loading: boolean;
};

export const AuthContext = createContext<AuthContext | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
