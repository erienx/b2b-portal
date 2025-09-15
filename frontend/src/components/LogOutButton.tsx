import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LogOutButton() {
    const { handleLogout, currentUser } = useAuth();
    const navigate = useNavigate();

    const handleOnLogout = async () => {
        await handleLogout();
        navigate('/');
    };

    return (
        <button
            onClick={currentUser ? handleOnLogout : undefined}
            className="block w-full bg-accent-bg text-accent-text py-3 px-6 rounded-md font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
        >
            Sign Out
        </button>
    );
}

export default LogOutButton;