// import { useForm } from 'react-hook-form';
// import type { SubmitHandler } from 'react-hook-form';

// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useAuth } from '../../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';
// import { UserRole } from '../../types/auth';
// import FormInput from '../ui/FormInput';
// import FormError from '../ui/FormError';
// import ButtonSubmit from '../ui/ButtonSubmit';

// import { Mail, Lock, User } from 'lucide-react';

// const schema = z
//     .object({
//         firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
//         lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
//         email: z.string().email('Please enter a valid email address'),
//         password: z.string().min(8, 'Password must be at least 8 characters long'),
//         confirmPassword: z.string().min(1, 'Please confirm your password'),
//         role: z.nativeEnum(UserRole).optional(),
//     })
//     .refine((data) => data.password === data.confirmPassword, {
//         path: ['confirmPassword'],
//         message: 'Passwords do not match',
//     });

// type FormFields = z.infer<typeof schema>;

// export default function RegisterForm() {
//     const {
//         register,
//         handleSubmit,
//         setError,
//         watch,
//         reset,
//         formState: { errors, isSubmitting },
//     } = useForm<FormFields>({
//         resolver: zodResolver(schema),
//     });

//     const firstNameValue = watch('firstName');
//     const lastNameValue = watch('lastName');
//     const emailValue = watch('email');
//     const passwordValue = watch('password');
//     const confirmPasswordValue = watch('confirmPassword');

//     const { handleRegister } = useAuth();
//     const navigate = useNavigate();

//     const onSubmit: SubmitHandler<FormFields> = async (data) => {
//         const role = data.role || undefined;

//         try {
//             await handleRegister(
//                 data.email,
//                 data.password,
//                 data.firstName,
//                 data.lastName,
//                 role
//             );
//             reset();
//             navigate('/dashboard');
//         } catch (err) {
//             if (err instanceof Error) {
//                 setError('root', {
//                     message: err.message,
//                 });
//             } else {
//                 setError('root', {
//                     message: 'Registration failed. Please try again.',
//                 });
//             }
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-bg">
//             <div className="bg-surface p-8 rounded-2xl shadow-lg min-w-[400px]">
//                 <h2 className="text-3xl font-bold mb-8 text-center text-white">Register</h2>

//                 <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
//                     <FormInput
//                         Icon={User}
//                         type="text"
//                         placeholder="First Name"
//                         value={firstNameValue}
//                         register={register('firstName')}
//                         error={errors.firstName}
//                     />

//                     <FormInput
//                         Icon={User}
//                         type="text"
//                         placeholder="Last Name"
//                         value={lastNameValue}
//                         register={register('lastName')}
//                         error={errors.lastName}
//                     />

//                     <FormInput
//                         Icon={Mail}
//                         type="email"
//                         placeholder="Email"
//                         value={emailValue}
//                         register={register('email')}
//                         error={errors.email}
//                     />

//                     <FormInput
//                         Icon={Lock}
//                         type="password"
//                         placeholder="Password"
//                         value={passwordValue}
//                         register={register('password')}
//                         error={errors.password}
//                         showToggle={true}
//                     />

//                     <FormInput
//                         Icon={Lock}
//                         type="password"
//                         placeholder="Confirm Password"
//                         value={confirmPasswordValue}
//                         register={register('confirmPassword')}
//                         error={errors.confirmPassword}
//                         showToggle={true}
//                     />

//                     <div className="mb-4">
//                         <select
//                             {...register('role')}
//                             className="w-full px-3 py-2 bg-surfaceLight border border-surfaceLight rounded-md text-white focus:outline-none focus:border-accent-bg"
//                         >
//                             <option value="">Select role (optional)</option>
//                             {Object.values(UserRole).map((role) => (
//                                 <option key={role} value={role}>
//                                     {role.replace('_', ' ')}
//                                 </option>
//                             ))}
//                         </select>
//                         {errors.role && <FormError error={errors.role} />}
//                     </div>

//                     <ButtonSubmit isSubmitting={isSubmitting} btnText="Register" />
//                     <FormError error={errors.root} />
//                 </form>

//                 <div className="mt-6 text-center">
//                     <p className="text-grey">
//                         Already have an account?{' '}
//                         <Link to="/login" className="text-accent-bg hover:text-accent-hover">
//                             Login here
//                         </Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// }