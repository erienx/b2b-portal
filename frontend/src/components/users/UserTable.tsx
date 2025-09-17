import { Unlock } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types/auth";
import { UserRole } from "../../types/auth";

interface Props {
    users: User[];
    fetchUsers: () => void;
}

const roleHierarchy: Record<User["role"], number> = {
    EMPLOYEE: 1,
    DISTRIBUTOR: 2,
    EXPORT_MANAGER: 3,
    ADMIN: 4,
    SUPER_ADMIN: 5,
};

export default function UserTable({ users, fetchUsers }: Props) {
    const { currentUser } = useAuth();
    const { fetch: unlockUser } = useApi<User>(null);
    const { fetch: toggleUserActive } = useApi<User>(null);

    const handleUnlock = async (id: string) => {
        await unlockUser({ url: `/users/${id}/unlock`, method: "POST" });
        fetchUsers();
    };

    const handleToggleActive = async (id: string, isActive: boolean) => {
        await toggleUserActive({
            url: `/users/${id}/toggle-active`,
            method: "POST",
            data: { isActive },
        });
        fetchUsers();
    };

    const canUnlock = (targetUser: User) =>
        currentUser &&
        targetUser.isLocked &&
        currentUser.id !== targetUser.id &&
        roleHierarchy[currentUser.role] > roleHierarchy[targetUser.role];

    const canToggleActive = (targetUser: User) =>
        currentUser &&
        currentUser.id !== targetUser.id &&
        roleHierarchy[currentUser.role] > roleHierarchy[targetUser.role] &&
        (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN);

    return (
        <div className="overflow-hidden rounded-lg border border-surfaceLight bg-surface shadow">
            <table className="min-w-full divide-y divide-surfaceLight">
                <thead className="bg-surfaceLight/30">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surfaceLight">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-surfaceLight/10">
                            <td className="px-4 py-3 text-white">
                                {user.firstName} {user.lastName}
                            </td>
                            <td className="px-4 py-3 text-white">{user.email}</td>
                            <td className="px-4 py-3 text-grey">{user.role.replace("_", " ")}</td>
                            <td className="px-4 py-3">
                                {user.isLocked ? (
                                    <span className="text-rose-400 font-medium">Locked</span>
                                ) : user.isActive ? (
                                    <span className="text-emerald-400">Active</span>
                                ) : (
                                    <span className="text-zinc-400">Inactive</span>
                                )}
                            </td>
                            <td className="px-4 py-3 flex gap-2">
                                {canUnlock(user) && (
                                    <button
                                        onClick={() => handleUnlock(user.id)}
                                        className="flex items-center gap-2 bg-accent-bg hover:bg-accent-hover text-white px-3 py-1 rounded-md transition cursor-pointer"
                                    >
                                        <Unlock className="w-4 h-4" /> Unlock
                                    </button>
                                )}
                                {canToggleActive(user) && (
                                    <button
                                        onClick={() => handleToggleActive(user.id, !user.isActive)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-md transition cursor-pointer ${user.isActive
                                                ? "bg-rose-500 hover:bg-rose-600 text-white"
                                                : "bg-emerald-500 hover:bg-emerald-600 text-white"
                                            }`}
                                    >
                                        {user.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
