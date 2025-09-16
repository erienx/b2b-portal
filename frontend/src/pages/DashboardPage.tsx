import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHasAccess } from '../hooks/useHasAccess';
import { UserRole } from '../types/auth';
import { BarChart3, FileText, Image, Users, TrendingUp, Package, Globe, Activity, Shield, } from 'lucide-react';

interface DashboardCard {
    title: string;
    description: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: React.ComponentType<any>;
    path: string;
    requiredRoles?: UserRole[];
    bgColor: string;
    iconColor: string;
}

function DashboardPage() {
    const { currentUser } = useAuth();
    const hasExportManagerAccess = useHasAccess([UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <div className="text-xl text-white">Loading...</div>
            </div>
        );
    }

    const dashboardCards: DashboardCard[] = [
        {
            title: "Sales Channels",
            description: "Report quarterly sales data across different distribution channels",
            icon: BarChart3,
            path: "/sales-channels",
            requiredRoles: [
                UserRole.DISTRIBUTOR,
                UserRole.EXPORT_MANAGER,
                UserRole.ADMIN,
                UserRole.SUPER_ADMIN,
            ],
            bgColor: "bg-blue-500/10",
            iconColor: "text-blue-500",
        },
        {
            title: "Purchase Reports",
            description: "Monitor purchase data and point of sale information",
            icon: TrendingUp,
            path: "/purchase-reports",
            requiredRoles: [UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
            bgColor: "bg-green-500/10",
            iconColor: "text-green-500",
        },
        {
            title: "Media Library",
            description: "Access marketing materials and product documentation",
            icon: Image,
            path: "/media",
            requiredRoles: [
                UserRole.EMPLOYEE,
                UserRole.DISTRIBUTOR,
                UserRole.EXPORT_MANAGER,
                UserRole.ADMIN,
                UserRole.SUPER_ADMIN,
            ],
            bgColor: "bg-purple-500/10",
            iconColor: "text-purple-500",
        },
        {
            title: "User Management",
            description: "Manage users, roles, and permissions",
            icon: Users,
            path: "/users",
            requiredRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER, UserRole.DISTRIBUTOR],
            bgColor: "bg-orange-500/10",
            iconColor: "text-orange-500",
        },
        {
            title: "Export Manager Panel",
            description: "Manage assigned distributors and view their performance",
            icon: Globe,
            path: "/export-manager",
            requiredRoles: [UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
            bgColor: "bg-cyan-500/10",
            iconColor: "text-cyan-500",
        },
        {
            title: "Activity Logs",
            description: "View system activity and user audit logs",
            icon: Activity,
            path: "/logs",
            requiredRoles: [UserRole.SUPER_ADMIN],
            bgColor: "bg-red-500/10",
            iconColor: "text-red-500",
        },
    ];


    const accessibleCards = dashboardCards.filter((card) =>
        card.requiredRoles ? card.requiredRoles.includes(currentUser.role) : true
    );

    const getRoleDisplayName = (role: UserRole): string => {
        switch (role) {
            case UserRole.SUPER_ADMIN:
                return 'Super Administrator';
            case UserRole.ADMIN:
                return 'Administrator';
            case UserRole.EXPORT_MANAGER:
                return 'Export Manager';
            case UserRole.DISTRIBUTOR:
                return 'Distributor';
            case UserRole.EMPLOYEE:
                return 'Distributor Employee';
            default:
                return role;
        }
    };


    return (



        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                    Dashboard
                </h2>
                <p className="text-grey text-lg">
                    Access your tools and manage your business operations
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-surface p-6 rounded-lg border border-surfaceLight">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-grey">Your Role</p>
                            <p className="text-xl font-semibold text-white">
                                {getRoleDisplayName(currentUser.role)}
                            </p>
                        </div>
                        <Shield className="h-8 w-8 text-accent-bg" />
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-lg border border-surfaceLight">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-grey">Available Modules</p>
                            <p className="text-xl font-semibold text-white">{accessibleCards.length}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

                {hasExportManagerAccess && (
                    <div className="bg-surface p-6 rounded-lg border border-surfaceLight">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-grey">Managed Distributors</p>
                                <p className="text-xl font-semibold text-white">-</p>
                            </div>
                            <Globe className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                )}

                <div className="bg-surface p-6 rounded-lg border border-surfaceLight">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-grey">Account Status</p>
                            <p className="text-xl font-semibold text-green-400">Active</p>
                        </div>
                        <Activity className="h-8 w-8 text-green-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accessibleCards.map((card) => {
                    const IconComponent = card.icon;
                    return (
                        <Link
                            key={card.path}
                            to={card.path}
                            className="group bg-surface p-6 rounded-lg border border-surfaceLight hover:border-accent-bg transition-all duration-200 hover:shadow-lg hover:shadow-accent-bg/10"
                        >
                            <div className={`inline-flex p-3 rounded-lg ${card.bgColor} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                                <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-accent-bg transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-grey text-sm leading-relaxed">
                                {card.description}
                            </p>
                            <div className="mt-4 flex items-center text-accent-bg text-sm font-medium">
                                Access Module
                                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {accessibleCards.length === 0 && (
                <div className="text-center py-12">
                    <Package className="h-16 w-16 text-grey mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No modules available
                    </h3>
                    <p className="text-grey">
                        You don't have access to any modules yet. Contact your administrator for assistance.
                    </p>
                </div>
            )}


        </div>

    );
}

export default DashboardPage;