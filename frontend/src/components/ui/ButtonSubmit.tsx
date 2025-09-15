import React from 'react';

type ButtonSubmitProps = {
    isSubmitting: boolean;
    btnText: string;
}

const ButtonSubmit = ({ isSubmitting, btnText }: ButtonSubmitProps) => {
    return (
        <button
            type="submit"
            disabled={isSubmitting}
            className="
        w-full bg-accent-bg text-accent-text py-3 px-4 rounded-md font-semibold
        hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent-bg focus:ring-offset-2 
        focus:ring-offset-surface transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
      "
        >
            {isSubmitting ? 'Loading...' : btnText}
        </button>
    );
};

export default ButtonSubmit;