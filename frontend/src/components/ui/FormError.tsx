type FormErrorProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any;
}

const FormError = ({ error }: FormErrorProps) => {
    if (!error) return null;

    return (
        <p className="text-sm text-red-400 mt-1">
            {error.message || error}
        </p>
    );
};

export default FormError;