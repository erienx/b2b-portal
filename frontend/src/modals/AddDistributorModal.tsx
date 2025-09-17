import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApi } from "../hooks/useApi";
import type { User } from "../types/auth";
import { X, Building, Globe, DollarSign, UserCheck } from "lucide-react";
import FormInput from "../components/ui/FormInput";
import FormError from "../components/ui/FormError";
import ButtonSubmit from "../components/ui/ButtonSubmit";

const createDistributorSchema = z.object({
    company_name: z
        .string()
        .min(1, "Company name is required")
        .max(255, "Company name must not exceed 255 characters"),
    country: z
        .string()
        .length(2, "Country code must be exactly 2 characters")
        .regex(/^[A-Z]{2}$/, "Country code must be uppercase letters"),
    currency: z
        .string()
        .length(3, "Currency code must be exactly 3 characters")
        .regex(/^[A-Z]{3}$/, "Currency code must be uppercase letters"),
    exportManagerId: z.string().optional(),
    assignedUsers: z.array(z.string()).optional(),
});

type CreateDistributorFormData = z.infer<typeof createDistributorSchema>;

interface ExportManager {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface Distributor {
    id: string;
    company_name: string;
    country: string;
    currency: string;
    exportManager?: User;
    assignments?: Array<{ user: User }>;
}

interface AddDistributorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddDistributorModal({ isOpen, onClose, onSuccess }: AddDistributorModalProps) {
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    
    const {
        data: exportManagers,
        fetch: fetchExportManagers,
    } = useApi<ExportManager[]>({
        url: "/distributors/export-managers",
        method: "GET",
    });

    const {
        data: users,
        fetch: fetchUsers,
    } = useApi<{ users: User[] }>({
        url: "/users",
        method: "GET",
    });

    const { fetch: createDistributor } = useApi<Distributor>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreateDistributorFormData>({
        resolver: zodResolver(createDistributorSchema),
        defaultValues: {
            assignedUsers: [],
        },
    });

    const watchedValues = watch();

    useEffect(() => {
        if (isOpen) {
            fetchExportManagers();
            fetchUsers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (users?.users) {
            const assignableUsers = users.users.filter(
                user => user.role === "DISTRIBUTOR" || user.role === "EMPLOYEE"
            );
            setAvailableUsers(assignableUsers);
        }
    }, [users]);

    const onSubmit = async (data: CreateDistributorFormData) => {
        try {
            await createDistributor({
                url: "/distributors",
                method: "POST",
                data: {
                    ...data,
                    country: data.country.toUpperCase(),
                    currency: data.currency.toUpperCase(),
                },
            });
            reset();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to create distributor:", err);
        }
    };

    const handleUserSelection = (userId: string, checked: boolean) => {
        const currentSelection = watchedValues.assignedUsers || [];
        if (checked) {
            setValue("assignedUsers", [...currentSelection, userId]);
        } else {
            setValue("assignedUsers", currentSelection.filter(id => id !== userId));
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface p-6 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Add New Distributor</h2>
                    <button
                        onClick={handleClose}
                        className="text-grey hover:text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput
                        Icon={Building}
                        type="text"
                        placeholder="Company Name"
                        value={watchedValues.company_name || ''}
                        register={register('company_name')}
                        error={errors.company_name}
                    />

                    <FormInput
                        Icon={Globe}
                        type="text"
                        placeholder="Country Code (e.g., PL, US, DE)"
                        value={watchedValues.country || ''}
                        register={register('country')}
                        error={errors.country}
                    />

                    <FormInput
                        Icon={DollarSign}
                        type="text"
                        placeholder="Currency Code (e.g., PLN, USD, EUR)"
                        value={watchedValues.currency || ''}
                        register={register('currency')}
                        error={errors.currency}
                    />

                    <div>
                        <label className="block text-sm font-medium text-grey mb-2">
                            Export Manager (Optional)
                        </label>
                        <select
                            {...register('exportManagerId')}
                            className="w-full px-3 py-2 bg-surfaceLight border border-surfaceLight rounded-md text-white focus:outline-none focus:border-accent-bg"
                        >
                            <option value="">Select Export Manager</option>
                            {exportManagers?.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.first_name} {manager.last_name} ({manager.email})
                                </option>
                            ))}
                        </select>
                        {errors.exportManagerId && <FormError error={errors.exportManagerId} />}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-grey mb-2">
                            Assign Users (Optional)
                        </label>
                        <div className="max-h-40 overflow-y-auto border border-surfaceLight rounded-md bg-surfaceLight">
                            {availableUsers.length === 0 ? (
                                <div className="p-3 text-grey text-sm">No users available for assignment</div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {availableUsers.map((user) => (
                                        <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={(watchedValues.assignedUsers || []).includes(user.id)}
                                                onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                                                className="rounded border-surfaceLight text-accent-bg focus:ring-accent-bg focus:ring-2"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <UserCheck className="w-4 h-4 text-grey" />
                                                <span className="text-white text-sm">
                                                    {user.firstName} {user.lastName}
                                                </span>
                                                <span className="text-grey text-xs">
                                                    ({user.role.replace('_', ' ')})
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-surfaceLight text-grey hover:text-white hover:border-white rounded-md transition"
                        >
                            Cancel
                        </button>
                        <ButtonSubmit 
                            isSubmitting={isSubmitting} 
                            btnText="Create Distributor"
                            className="flex-1"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}