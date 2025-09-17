import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { Plus, Building } from "lucide-react";
import type { User } from "../types/auth";
import { UserRole } from "../types/auth";
import { AddDistributorModal } from "../modals/AddDistributorModal";
import UserTable from "../components/users/UserTable";
import DistributorTable from "../components/distributors/DistributorTable";
import AddUserModal from "../modals/AddUserModal";

interface Distributor {
    id: string;
    company_name: string;
    country: string;
    currency: string;
    exportManager?: User;
}

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

    useEffect(() => {
        fetchUsers();
        fetchDistributors();
    }, []);

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
                <UserTable users={users?.users || []} fetchUsers={fetchUsers} />
            )}

            {activeTab === "distributors" && (
                <DistributorTable
                    distributors={distributors || []}
                    loading={distributorsLoading}
                    error={distributorsError}
                />
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
