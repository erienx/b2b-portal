import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/ui/FormInput';
import FormError from '../components/ui/FormError';
import ButtonSubmit from '../components/ui/ButtonSubmit';
import { Lock } from 'lucide-react';

const schema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

type FormFields = z.infer<typeof schema>;

export default function ChangePasswordPage() {
    const { handleChangePassword } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            await handleChangePassword(data.currentPassword, data.newPassword);
            navigate('/dashboard');
        } catch (err) {
            if (err instanceof Error) {
                setError('root', { message: err.message });
            } else {
                setError('root', { message: 'Password change failed' });
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg">
            <div className="bg-surface p-8 rounded-2xl shadow-lg min-w-[400px]">
                <h2 className="text-3xl font-bold mb-8 text-center text-white">Change Password</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
                    <FormInput
                        Icon={Lock}
                        type="password"
                        placeholder="Current Password"
                        register={register('currentPassword')}
                        error={errors.currentPassword}
                        showToggle={true}
                    />
                    <FormInput
                        Icon={Lock}
                        type="password"
                        placeholder="New Password"
                        register={register('newPassword')}
                        error={errors.newPassword}
                        showToggle={true}
                    />
                    <ButtonSubmit isSubmitting={isSubmitting} btnText="Change Password" />
                    <FormError error={errors.root} />
                </form>
            </div>
        </div>
    );
}
