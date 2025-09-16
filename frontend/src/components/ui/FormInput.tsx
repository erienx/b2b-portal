import React, { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import FormError from './FormError';
import PasswordToggle from './PasswordToggle';

type FormInputProps = {
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    type: string;
    placeholder: string;
    register: UseFormRegisterReturn;
    value?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any;
    showToggle?: boolean;
}

const FormInput = ({ Icon, type, placeholder, register, value, error, showToggle = false }: FormInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === "password";
    const hasValue = value && value.length > 0;
    const hasError = !!error;


    const getBorderColor = () => {
        if (hasError) return "border-red-400";
        if (hasValue) return "border-accent-bg";
        if (isFocused) return "border-accent-bg";
        return "border-surfaceLight";
    };

    return (
        <>
            <div className="relative group">
                <Icon
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-150 text-white`}
                />
                <input
                    {...register}
                    type={showPassword ? "text" : type}
                    placeholder={placeholder}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
            pl-10 py-3 border rounded-md w-full outline-none transition-colors duration-150 
            bg-surfaceLight text-white placeholder-grey
            ${showToggle && isPassword ? "pr-12" : "pr-4"}
            ${getBorderColor()}
            focus:border-accent-bg
          `}
                />
                {isPassword && showToggle && (
                    <PasswordToggle
                        show={showPassword}
                        toggle={() => setShowPassword((prev) => !prev)}
                    />
                )}
            </div>
            <FormError error={error} />
        </>
    );
};

export default FormInput;