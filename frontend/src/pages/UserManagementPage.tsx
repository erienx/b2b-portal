import { useEffect } from "react";
import { useApi } from "../hooks/useApi";
import type { User } from "../types/auth";
import { useAuth } from "../context/AuthContext";
import { Unlock } from "lucide-react";

export default function UserManagementPage() {
    const { currentUser } = useAuth();

    const {
        data: users,
        loading,
        error,
        fetch: fetchUsers,
    } = useApi<{ users: User[] }>({
        url: "/users",
        method: "GET",
    });

    const { fetch: unlockUser } = useApi<User>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUnlock = async (id: string) => {
        try {
            await unlockUser({
                url: `/users/${id}/unlock`,
                method: "POST",
            });
            await fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const roleHierarchy: Record<User["role"], number> = {
        EMPLOYEE: 1,
        DISTRIBUTOR: 2,
        EXPORT_MANAGER: 3,
        ADMIN: 4,
        SUPER_ADMIN: 5,
    };

    const canUnlock = (currentUser: User, targetUser: User) => {
        return (
            targetUser.isLocked &&
            currentUser.id !== targetUser.id &&
            roleHierarchy[currentUser.role] > roleHierarchy[targetUser.role]
        );
    };

    if (loading) return <div className="text-white">Loading users...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>

            <div className="overflow-hidden rounded-lg border border-surfaceLight bg-surface shadow">
                <table className="min-w-full divide-y divide-surfaceLight">
                    <thead className="bg-surfaceLight/30">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-grey">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-grey">
                                Role
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-grey">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-grey">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surfaceLight">
                        {users?.users.map((user) => (
                            <tr key={user.id} className="hover:bg-surfaceLight/10">
                                <td className="px-4 py-3 text-white">{user.email}</td>
                                <td className="px-4 py-3 text-grey">{user.role}</td>
                                <td className="px-4 py-3">
                                    {user.isLocked ? (
                                        <span className="text-red-500 font-medium">Locked</span>
                                    ) : (
                                        <span className="text-green-400">Active</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {currentUser && canUnlock(currentUser, user) ? (
                                        <button
                                            onClick={() => handleUnlock(user.id)}
                                            className="flex items-center gap-2 bg-accent-bg hover:bg-accent-hover text-white px-3 py-1 rounded-md transition"
                                        >
                                            <Unlock className="w-4 h-4" /> Unlock
                                        </button>
                                    ) : (
                                        <span className="text-grey">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
