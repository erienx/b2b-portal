/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { Plus, Building, Unlock } from "lucide-react";
import type { User } from "../types/auth";
import { UserRole } from "../types/auth";
import { AddDistributorModal } from "../modals/AddDistributorModal";
import AddUserModal from "../modals/AddUserModal";

interface Distributor {
    id: string;
    company_name: string;
    country: string;
    currency: string;
    exportManager?: User;
}

const roleHierarchy: Record<User["role"], number> = {
    EMPLOYEE: 1,
    DISTRIBUTOR: 2,
    EXPORT_MANAGER: 3,
    ADMIN: 4,
    SUPER_ADMIN: 5,
};

export default function UserManagementPage() {
    const { currentUser } = useAuth();
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isAddDistributorModalOpen, setIsAddDistributorModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"users" | "distributors">("users");

    const {
        data: users,
        loading,
        error,
        fetch: fetchUsers,
    } = useApi<{ users: User[] }>({ url: "/users", method: "GET" });

    const {
        data: distributors,
        loading: distributorsLoading,
        error: distributorsError,
        fetch: fetchDistributors,
    } = useApi<Distributor[]>({ url: "/distributors", method: "GET" });

    const { fetch: unlockUser } = useApi<User>(null);
    const { fetch: toggleUserActive } = useApi<User>(null);

    useEffect(() => {
        fetchUsers();
        fetchDistributors();
    }, []);

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

    const canAddUsers =
        currentUser &&
        (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN);

    if (loading) return <div className="text-white">Loading users...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-4 py-2 rounded-md font-medium transition ${activeTab === "users"
                            ? "bg-accent-bg text-white"
                            : "bg-surfaceLight text-grey hover:text-white"
                        }`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab("distributors")}
                    className={`px-4 py-2 rounded-md font-medium transition ${activeTab === "distributors"
                            ? "bg-accent-bg text-white"
                            : "bg-surfaceLight text-grey hover:text-white"
                        }`}
                >
                    Distributors
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">
                    {activeTab === "users" ? "User Management" : "Distributor Management"}
                </h1>
                {canAddUsers && (
                    <div className="flex gap-2">
                        {activeTab === "users" && (
                            <button
                                onClick={() => setIsAddUserModalOpen(true)}
                                className="flex items-center gap-2 bg-accent-bg hover:bg-accent-hover text-white px-4 py-2 rounded-md transition"
                            >
                                <Plus className="w-4 h-4" />
                                Add User
                            </button>
                        )}
                        {activeTab === "distributors" && (
                            <button
                                onClick={() => setIsAddDistributorModalOpen(true)}
                                className="flex items-center gap-2 bg-accent-bg hover:bg-accent-hover text-white px-4 py-2 rounded-md transition"
                            >
                                <Building className="w-4 h-4" />
                                Add Distributor
                            </button>
                        )}
                    </div>
                )}
            </div>

            {activeTab === "users" && (
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
                            {(users?.users || []).map((user) => (
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
            )}

            {activeTab === "distributors" && (
                <div className="overflow-hidden rounded-lg border border-surfaceLight bg-surface shadow">
                    {distributorsLoading && <div className="text-white">Loading distributors...</div>}
                    {distributorsError && <div className="text-red-500">Error: {distributorsError}</div>}
                    {!distributorsLoading && !distributorsError && (
                        <table className="min-w-full divide-y divide-surfaceLight">
                            <thead className="bg-surfaceLight/30">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Company Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Country</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Currency</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Export Manager</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surfaceLight">
                                {(distributors || []).map((d) => (
                                    <tr key={d.id} className="hover:bg-surfaceLight/10">
                                        <td className="px-4 py-3 text-white">{d.company_name}</td>
                                        <td className="px-4 py-3 text-grey">{d.country}</td>
                                        <td className="px-4 py-3 text-grey">{d.currency}</td>
                                        <td className="px-4 py-3 text-white">
                                            {d.exportManager
                                                ? `${(d.exportManager as any).first_name ??
                                                (d.exportManager as any).firstName ??
                                                ""} ${(d.exportManager as any).last_name ??
                                                (d.exportManager as any).lastName ??
                                                ""}`
                                                : "Not assigned"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-emerald-400">Active</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSuccess={fetchUsers}
            />

            <AddDistributorModal
                isOpen={isAddDistributorModalOpen}
                onClose={() => setIsAddDistributorModalOpen(false)}
                onSuccess={() => {
                    fetchDistributors();
                    setActiveTab("distributors");
                }}
            />
        </div>
    );
}
