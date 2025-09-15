import LogOutButton from '../components/LogOutButton';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <div>Loading...</div>;
    }
    else {
        console.log(currentUser);
    }

    return (
        <div className='flex flex-col gap-3 justify-center items-center m-4'>
            <h1 className='text-2xl'>DashboardPage</h1>
            <p>Welcome, {currentUser?.firstName} {currentUser?.lastName}!</p>
            <LogOutButton />
        </div>
    );
}

export default DashboardPage;