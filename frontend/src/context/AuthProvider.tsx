import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../types/auth';
import * as authApi from '../api/auth';

type AuthProviderProps = PropsWithChildren;

export default function AuthProvider({ children }: AuthProviderProps) {
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function tryRefresh() {
            try {
                const existingToken = localStorage.getItem('accessToken');
                if (existingToken) {
                    setAuthToken(existingToken);
                    const user = await authApi.getMe();
                    setCurrentUser(user);
                } else {
                    const accessToken = await authApi.refreshToken();
                    localStorage.setItem('accessToken', accessToken);
                    setAuthToken(accessToken);
                    const user = await authApi.getMe();
                    setCurrentUser(user);
                }
            } catch {
                localStorage.removeItem('accessToken');
                setAuthToken(null);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        }

        tryRefresh();
    }, []);

    async function handleLogin(email: string, password: string) {
        try {
            const { user, accessToken } = await authApi.login({ email, password });
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            setAuthToken(accessToken);
            setCurrentUser(user);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Login error:', error.response?.data || error.message || error);
            const message = error.response?.data?.message || 'Login failed';
            throw new Error(message);
        }
    }

    async function handleLogout() {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('accessToken');
            setAuthToken(null);
            setCurrentUser(null);
        }
    }

    async function handleChangePassword(currentPassword: string, newPassword: string) {
        await authApi.changePassword({ currentPassword, newPassword });
        const user = await authApi.getMe();
        setCurrentUser(user);
    }

    return (
        <AuthContext.Provider
            value={{
                authToken,
                currentUser,
                handleLogin,
                handleLogout,
                handleChangePassword,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
