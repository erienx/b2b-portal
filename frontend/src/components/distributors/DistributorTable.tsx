/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from "../../types/auth";

interface Distributor {
    id: string;
    company_name: string;
    country: string;
    currency: string;
    exportManager?: User;
}

interface Props {
    distributors: Distributor[];
    loading: boolean;
    error: string | null;
}

export default function DistributorTable({ distributors, loading, error }: Props) {
    if (loading) return <div className="text-white">Loading distributors...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="overflow-hidden rounded-lg border border-surfaceLight bg-surface shadow">
            <table className="min-w-full divide-y divide-surfaceLight">
                <thead className="bg-surfaceLight/30">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Company Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Country</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Currency</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Export Manager</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surfaceLight">
                    {distributors.map((d) => (
                        <tr key={d.id} className="hover:bg-surfaceLight/10">
                            <td className="px-4 py-3 text-white">{d.company_name}</td>
                            <td className="px-4 py-3 text-grey">{d.country}</td>
                            <td className="px-4 py-3 text-grey">{d.currency}</td>
                            <td className="px-4 py-3 text-white">
                                {d.exportManager
                                    ? `${(d.exportManager as any).first_name ??
                                    (d.exportManager as any).firstName ??
                                    ""} ${(d.exportManager as any).last_name ??
                                    (d.exportManager as any).lastName ??
                                    ""}`
                                    : "Not assigned"}
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-emerald-400">Active</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
