import { Package } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LogOutButton from "../LogOutButton";
import { Link } from "react-router-dom";

export default function Header() {
    const { currentUser } = useAuth();

    return (
        <header className="bg-surface border-b border-surfaceLight z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">

                    <Link
                        className="flex items-center gap-3 whitespace-nowrap"
                        to={"/dashboard"}
                    >
                        <Package className="h-8 w-8 text-accent-bg flex-shrink-0" />
                        <h1 className="text-xl font-bold text-white">B2B Portal</h1>
                    </Link>

                    {currentUser && (
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col whitespace-nowrap">
                                <span className="text-sm text-grey">Welcome back</span>
                                <span className="text-white font-medium">
                                    {currentUser.firstName} {currentUser.lastName}
                                </span>
                            </div>
                            <LogOutButton />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
