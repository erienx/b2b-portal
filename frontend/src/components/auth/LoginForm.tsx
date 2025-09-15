import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormInput from '../ui/FormInput';
import FormError from '../ui/FormError';
import ButtonSubmit from '../ui/ButtonSubmit';

import { Mail, Lock } from 'lucide-react';

const schema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type FormFields = z.infer<typeof schema>;

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        setError,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
    });

    const emailValue = watch('email');
    const passwordValue = watch('password');

    const { handleLogin } = useAuth();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            await handleLogin(data.email, data.password);

            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
            if (storedUser?.must_change_password) {
                navigate('/change-password');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            if (err instanceof Error) {
                setError('root', {
                    message: err.message,
                });
            } else {
                setError('root', {
                    message: 'Login failed. Please try again.',
                });
            }
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-bg">
            <div className="bg-surface p-8 rounded-2xl shadow-lg min-w-[400px]">
                <h2 className="text-3xl font-bold mb-8 text-center text-white">Login</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
                    <FormInput
                        Icon={Mail}
                        type="email"
                        placeholder="Email"
                        value={emailValue}
                        register={register('email')}
                        error={errors.email}
                    />

                    <FormInput
                        Icon={Lock}
                        type="password"
                        placeholder="Password"
                        value={passwordValue}
                        register={register('password')}
                        error={errors.password}
                        showToggle={true}
                    />

                    <ButtonSubmit isSubmitting={isSubmitting} btnText="Login" />
                    <FormError error={errors.root} />
                </form>

                <div className="mt-6 text-center">
                    <p className="text-white ">
                        Don't have an account?{'\n'}
                    </p>
                    <p className="text-grey text-sm">
                        Please contact your system administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}