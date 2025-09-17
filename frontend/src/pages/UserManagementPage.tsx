import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApi } from "../hooks/useApi";
import type { User } from "../types/auth";
import { useAuth } from "../context/AuthContext";
import { Unlock, Plus, X, User as UserIcon, Mail, Lock, Building } from "lucide-react";
import { UserRole } from "../types/auth";
import FormInput from "../components/ui/FormInput";
import FormError from "../components/ui/FormError";
import ButtonSubmit from "../components/ui/ButtonSubmit";
import { AddDistributorModal } from "../modals/AddDistributorModal";

const createUserSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(100, "First name is too long"),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
        .regex(/\d/, "Password must contain at least one digit"),
    role: z.nativeEnum(UserRole).describe("Role is required"),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

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
    const [activeTab, setActiveTab] = useState<'users' | 'distributors'>('users');

    const {
        data: users,
        loading,
        error,
        fetch: fetchUsers,
    } = useApi<{ users: User[] }>({
        url: "/users",
        method: "GET",
    });

    const {
        data: distributors,
        loading: distributorsLoading,
        error: distributorsError,
        fetch: fetchDistributors,
    } = useApi<Distributor[]>({
        url: "/distributors",
        method: "GET",
    });

    const { fetch: unlockUser } = useApi<User>(null);
    const { fetch: createUser } = useApi<User>(null);
    const { fetch: toggleUserActive } = useApi<User>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserSchema),
    });

    const watchedValues = watch();

    useEffect(() => {
        fetchUsers();
        fetchDistributors();
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

    const onCreateUser = async (data: CreateUserFormData) => {
        try {
            await createUser({
                url: "/users",
                method: "POST",
                data,
            });
            await fetchUsers();
            reset();
            setIsAddUserModalOpen(false);
        } catch (err) {
            console.error("Failed to create user:", err);
        }
    };
    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            await toggleUserActive({
                url: `/users/${id}/toggle-active`,
                method: "POST",
                data: { isActive },
            });
            await fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };
    const canToggleActive = (currentUser: User, targetUser: User) => {
        if (!currentUser) return false;
        if (currentUser.id === targetUser.id) return false;

        const roleHierarchy: Record<User["role"], number> = {
            EMPLOYEE: 1,
            DISTRIBUTOR: 2,
            EXPORT_MANAGER: 3,
            ADMIN: 4,
            SUPER_ADMIN: 5,
        };

        return (
            roleHierarchy[currentUser.role] > roleHierarchy[targetUser.role] &&
            (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN)
        );
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

    const canAddUsers = currentUser &&
        (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN);

    const getAvailableRoles = () => {
        if (!currentUser) return [];

        switch (currentUser.role) {
            case UserRole.SUPER_ADMIN:
                return Object.values(UserRole);
            case UserRole.ADMIN:
                return [UserRole.EMPLOYEE, UserRole.DISTRIBUTOR, UserRole.EXPORT_MANAGER];
            default:
                return [];
        }
    };


    if (loading) return <div className="text-white">Loading users...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-md font-medium transition ${activeTab === 'users'
                        ? 'bg-accent-bg text-white'
                        : 'bg-surfaceLight text-grey hover:text-white'
                        }`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('distributors')}
                    className={`px-4 py-2 rounded-md font-medium transition ${activeTab === 'distributors'
                        ? 'bg-accent-bg text-white'
                        : 'bg-surfaceLight text-grey hover:text-white'
                        }`}
                >
                    Distributors
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">
                    {activeTab === 'users' ? 'User Management' : 'Distributor Management'}
                </h1>
                {canAddUsers && (
                    <div className="flex gap-2">
                        {activeTab === 'users' && (
                            <button
                                onClick={() => setIsAddUserModalOpen(true)}
                                className="flex items-center gap-2 bg-accent-bg hover:bg-accent-hover text-white px-4 py-2 rounded-md transition"
                            >
                                <Plus className="w-4 h-4" />
                                Add User
                            </button>
                        )}
                        {activeTab === 'distributors' && (
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

            {activeTab === 'users' && (
                <>
                    {loading && <div className="text-white">Loading users...</div>}
                    {error && <div className="text-red-500">Error: {error}</div>}
                    {!loading && !error && (
                        <div className="overflow-hidden rounded-lg border border-surfaceLight bg-surface shadow">
                            <table className="min-w-full divide-y divide-surfaceLight">
                                <thead className="bg-surfaceLight/30">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">
                                            Name
                                        </th>
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
                                            <td className="px-4 py-3 text-white">
                                                {user.firstName} {user.lastName}
                                            </td>
                                            <td className="px-4 py-3 text-white">{user.email}</td>
                                            <td className="px-4 py-3 text-grey">{user.role.replace('_', ' ')}</td>
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
                                                {currentUser && canUnlock(currentUser, user) && (
                                                    <button
                                                        onClick={() => handleUnlock(user.id)}
                                                        className="flex items-center gap-2 bg-accent-bg hover:bg-accent-hover text-white px-3 py-1 rounded-md transition cursor-pointer"
                                                    >
                                                        <Unlock className="w-4 h-4" /> Unlock
                                                    </button>
                                                )}

                                                {currentUser && canToggleActive(currentUser, user) && (
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
                </>
            )}

            {activeTab === 'distributors' && (
                <>
                    {distributorsLoading && <div className="text-white">Loading distributors...</div>}
                    {distributorsError && <div className="text-red-500">Error: {distributorsError}</div>}
                    {!distributorsLoading && !distributorsError && (
                        <div className="overflow-hidden rounded-lg border border-surfaceLight bg-surface shadow">
                            <table className="min-w-full divide-y divide-surfaceLight">
                                <thead className="bg-surfaceLight/30">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">
                                            Company Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">
                                            Country
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">
                                            Currency
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">
                                            Export Manager
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surfaceLight">
                                    {distributors?.map((distributor) => (
                                        <tr key={distributor.id} className="hover:bg-surfaceLight/10">
                                            <td className="px-4 py-3 text-white">{distributor.company_name}</td>
                                            <td className="px-4 py-3 text-grey">{distributor.country}</td>
                                            <td className="px-4 py-3 text-grey">{distributor.currency}</td>
                                            <td className="px-4 py-3 text-white">
                                                {distributor.exportManager
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    ? `${(distributor.exportManager as any).first_name ?? (distributor.exportManager as any).firstName ?? ' '} ${(distributor.exportManager as any).last_name ?? (distributor.exportManager as any).lastName ?? ''}`
                                                    : 'Not assigned'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-green-400">Active</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {isAddUserModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-surface p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Add New User</h2>
                            <button
                                onClick={() => {
                                    setIsAddUserModalOpen(false);
                                    reset();
                                }}
                                className="text-grey hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4">
                            <FormInput
                                Icon={UserIcon}
                                type="text"
                                placeholder="First Name"
                                value={watchedValues.firstName || ''}
                                register={register('firstName')}
                                error={errors.firstName}
                            />

                            <FormInput
                                Icon={UserIcon}
                                type="text"
                                placeholder="Last Name"
                                value={watchedValues.lastName || ''}
                                register={register('lastName')}
                                error={errors.lastName}
                            />

                            <FormInput
                                Icon={Mail}
                                type="email"
                                placeholder="Email"
                                value={watchedValues.email || ''}
                                register={register('email')}
                                error={errors.email}
                            />

                            <FormInput
                                Icon={Lock}
                                type="password"
                                placeholder="Password"
                                value={watchedValues.password || ''}
                                register={register('password')}
                                error={errors.password}
                                showToggle={true}
                            />

                            <div>
                                <select
                                    {...register('role')}
                                    className="w-full px-3 py-2 bg-surfaceLight border border-surfaceLight rounded-md text-white focus:outline-none focus:border-accent-bg"
                                >
                                    <option value="">Select role</option>
                                    {getAvailableRoles().map((role) => (
                                        <option key={role} value={role}>
                                            {role.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && <FormError error={errors.role} />}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddUserModalOpen(false);
                                        reset();
                                    }}
                                    className="flex-1 px-4 py-2 border border-surfaceLight text-grey hover:text-white hover:border-white rounded-md transition"
                                >
                                    Cancel
                                </button>
                                <ButtonSubmit
                                    isSubmitting={isSubmitting}
                                    btnText="Create User"
                                    className="flex-1"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AddDistributorModal
                isOpen={isAddDistributorModalOpen}
                onClose={() => setIsAddDistributorModalOpen(false)}
                onSuccess={() => {
                    fetchDistributors();
                    setActiveTab('distributors');
                }}
            />
        </div>
    );
}