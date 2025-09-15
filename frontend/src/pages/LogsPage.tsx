import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { UserRole } from "../types/auth";
import { format } from "date-fns";
import { DownloadCloud } from "lucide-react";

type LogRow = {
    id: string;
    user: { id?: string; email?: string; firstName?: string; lastName?: string; role?: UserRole } | null;
    action: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any;
    createdAt: string;
};

export default function LogsPage() {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(25);
    const [search, setSearch] = useState<string>("");
    const [actionFilter, setActionFilter] = useState<string>("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");

    const { data, loading, fetch } = useApi<{ logs: LogRow[]; total: number; totalPages: number }>({
        url: `/logs?page=${page}&limit=${limit}`,
        method: "GET",
    });

    const load = async () => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (search) params.set("search", search);
        if (actionFilter) params.set("action", actionFilter);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
        await fetch({ url: `/logs?${params.toString()}`, method: "GET" });
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit]);

    const handleSearch = async () => {
        setPage(1);
        await load();
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (actionFilter) params.set("action", actionFilter);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
        window.open(`/logs/export?${params.toString()}`, "_blank");
    };

    const logs = data?.logs ?? [];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
                    <p className="text-grey">Audit trail of system events and user activity</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-accent-bg hover:bg-accent-hover text-white px-3 py-2 rounded-md transition"
                    >
                        <DownloadCloud className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-surface p-4 rounded-lg mb-6 border border-surfaceLight flex flex-col md:flex-row gap-4">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search (email, user-agent, details...)"
                    className="bg-bg text-white placeholder:text-grey px-3 py-2 rounded-md w-full md:w-1/3"
                />
                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="bg-bg text-white px-3 py-2 rounded-md w-full md:w-1/6"
                >
                    <option value="">All actions</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="LOGOUT">LOGOUT</option>
                    <option value="CREATE_SALES_REPORT">CREATE_SALES_REPORT</option>
                    <option value="UPDATE_SALES_REPORT">UPDATE_SALES_REPORT</option>
                    <option value="CREATE_PURCHASE_REPORT">CREATE_PURCHASE_REPORT</option>
                    <option value="UPDATE_PURCHASE_REPORT">UPDATE_PURCHASE_REPORT</option>
                    <option value="UPLOAD_FILE">UPLOAD_FILE</option>
                    <option value="DOWNLOAD_FILE">DOWNLOAD_FILE</option>
                    <option value="EXPORT_DATA">EXPORT_DATA</option>
                    <option value="ACCOUNT_UNLOCKED">ACCOUNT_UNLOCKED</option>
                </select>

                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-bg text-white px-3 py-2 rounded-md w-full md:w-1/6" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-bg text-white px-3 py-2 rounded-md w-full md:w-1/6" />

                <div className="flex gap-2">
                    <button onClick={handleSearch} className="bg-accent-bg hover:bg-accent-hover text-white px-3 py-2 rounded-md">
                        Apply
                    </button>
                    <button
                        onClick={async () => {
                            setSearch("");
                            setActionFilter("");
                            setDateFrom("");
                            setDateTo("");
                            setPage(1);
                            await fetch({ url: `/logs?page=1&limit=${limit}`, method: "GET" });
                        }}
                        className="bg-surfaceLight text-white px-3 py-2 rounded-md"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-surfaceLight bg-surface shadow">
                <table className="min-w-full divide-y divide-surfaceLight">
                    <thead className="bg-surfaceLight/30">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Time</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-grey">User</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Action</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Resource</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-grey">IP / Agent</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-grey">Details</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-surfaceLight">
                        {loading && (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-white">Loading...</td>
                            </tr>
                        )}

                        {!loading && logs.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-grey">No logs found</td>
                            </tr>
                        )}

                        {logs.map((l) => (
                            <tr key={l.id} className="hover:bg-surfaceLight/10">
                                <td className="px-4 py-3 text-white whitespace-nowrap">
                                    {format(new Date(l.createdAt), "yyyy-MM-dd HH:mm:ss")}
                                </td>
                                <td className="px-4 py-3 text-grey">
                                    {l.user ? (
                                        <div>
                                            <div className="text-white">{l.user.email}</div>
                                            <div className="text-sm text-grey">{l.user.firstName} {l.user.lastName}</div>
                                        </div>
                                    ) : (
                                        <span className="text-grey">system</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-white">{l.action}</td>
                                <td className="px-4 py-3 text-grey">
                                    {l.resourceType ? `${l.resourceType}${l.resourceId ? ` (${l.resourceId})` : ''}` : '—'}
                                </td>
                                <td className="px-4 py-3 text-grey">
                                    <div>{l.ipAddress ?? '—'}</div>
                                    <div className="text-sm truncate max-w-xs">{l.userAgent ?? ''}</div>
                                </td>
                                <td className="px-4 py-3 text-white">
                                    <pre className="text-sm max-w-xl truncate">{typeof l.details === 'string' ? l.details : JSON.stringify(l.details)}</pre>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-grey text-sm">
                    Total: {data?.total ?? 0}
                </div>
                <div className="flex items-center gap-2">
                    <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="bg-bg text-white px-2 py-1 rounded-md">
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>

                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded-md bg-surfaceLight text-white">Prev</button>
                    <div className="text-white">Page {page} / {data?.totalPages ?? 1}</div>
                    <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded-md bg-surfaceLight text-white">Next</button>
                </div>
            </div>
        </div>
    );
}
