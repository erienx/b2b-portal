import { X, User as UserIcon, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole, type User } from "../types/auth";
import { useApi } from "../hooks/useApi";
import ButtonSubmit from "../components/ui/ButtonSubmit";
import FormError from "../components/ui/FormError";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/ui/FormInput";


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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddUserModal({ isOpen, onClose, onSuccess }: Props) {
    const { currentUser } = useAuth();
    const { fetch: createUser } = useApi<User>(null);

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

    const onCreateUser = async (data: CreateUserFormData) => {
        try {
            await createUser({ url: "/users", method: "POST", data });
            onSuccess();
            reset();
            onClose();
        } catch (err) {
            console.error("Failed to create user:", err);
        }
    };

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

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
            <div className="bg-surface p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Add New User</h2>
                    <button onClick={onClose} className="text-grey hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4">
                    <FormInput
                        Icon={UserIcon}
                        type="text"
                        placeholder="First Name"
                        value={watchedValues.firstName || ""}
                        register={register("firstName")}
                        error={errors.firstName}
                    />

                    <FormInput
                        Icon={UserIcon}
                        type="text"
                        placeholder="Last Name"
                        value={watchedValues.lastName || ""}
                        register={register("lastName")}
                        error={errors.lastName}
                    />

                    <FormInput
                        Icon={Mail}
                        type="email"
                        placeholder="Email"
                        value={watchedValues.email || ""}
                        register={register("email")}
                        error={errors.email}
                    />

                    <FormInput
                        Icon={Lock}
                        type="password"
                        placeholder="Password"
                        value={watchedValues.password || ""}
                        register={register("password")}
                        error={errors.password}
                        showToggle={true}
                    />

                    <div>
                        <select
                            {...register("role")}
                            className="w-full px-3 py-2 bg-surfaceLight border border-surfaceLight rounded-md text-white focus:outline-none focus:border-accent-bg"
                        >
                            <option value="">Select role</option>
                            {getAvailableRoles().map((role) => (
                                <option key={role} value={role}>
                                    {role.replace("_", " ")}
                                </option>
                            ))}
                        </select>
                        {errors.role && <FormError error={errors.role} />}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-surfaceLight text-grey hover:text-white hover:border-white rounded-md transition"
                        >
                            Cancel
                        </button>
                        <ButtonSubmit isSubmitting={isSubmitting} btnText="Create User" className="flex-1" />
                    </div>
                </form>
            </div>
        </div>
    );
}
