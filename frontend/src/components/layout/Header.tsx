import { Package } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LogOutButton from "../LogOutButton";

export default function Header() {
    const { currentUser } = useAuth();

    return (
        <header className="bg-surface border-b border-surfaceLight sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-3">
                        <Package className="h-8 w-8 text-accent-bg" />
                        <h1 className="text-xl font-bold text-white">B2B Portal</h1>
                    </div>
                    {currentUser && (
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm text-grey">Welcome back</p>
                                <p className="text-white font-medium">
                                    {currentUser.firstName} {currentUser.lastName}
                                </p>
                            </div>
                            <LogOutButton />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
