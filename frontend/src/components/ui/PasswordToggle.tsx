import { Eye, EyeOff } from 'lucide-react';

type PasswordToggleProps = {
  show: boolean;
  toggle: () => void;
}

const PasswordToggle = ({ show, toggle }: PasswordToggleProps) => {
  return (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-grey hover:text-accent-bg transition-colors duration-150"
      tabIndex={-1}
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
};

export default PasswordToggle;