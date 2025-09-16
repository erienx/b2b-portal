/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Distributor = { id: string; company_name: string };

type PurchaseReportData = {
    id?: string;
    year: number;
    quarter: number;
    last_year_sales: number;
    purchases: number;
    budget: number;
    actual_sales: number;
    total_pos: number;
    new_openings: number;
    new_openings_target: number;
    totalYearVsLastYear: number;
    totalYearVsBudget: number;
};

export default function PurchaseReportPage() {
    const { currentUser } = useAuth();

    const hasAccess = currentUser && ["EXPORT_MANAGER", "ADMIN", "SUPER_ADMIN"].includes(currentUser.role);

    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [quarter, setQuarter] = useState<number>(1);

    const [lastYearSales, setLastYearSales] = useState<number>(0);
    const [purchases, setPurchases] = useState<number>(0);
    const [budget, setBudget] = useState<number>(0);
    const [totalPos, setTotalPos] = useState<number>(0);
    const [newOpenings, setNewOpenings] = useState<number>(0);
    const [newOpeningsTarget, setNewOpeningsTarget] = useState<number>(0);

    const [actualSales, setActualSales] = useState<number>(0);
    const [totalYearVsLastYear, setTotalYearVsLastYear] = useState<number>(0);
    const [totalYearVsBudget, setTotalYearVsBudget] = useState<number>(0);

    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [selectedDistributor, setSelectedDistributor] = useState<string>("");
    const [dashboardData, setDashboardData] = useState<any[]>([]);

    const { fetch: postReport } = useApi<any>(null);
    const { fetch: fetchDistributors } = useApi<{ distributors: Distributor[] }>({ url: "/distributors", method: "GET" });
    const { fetch: fetchReport } = useApi<PurchaseReportData>(null);
    const { fetch: fetchDashboard } = useApi<any[]>(null);

    const [reportId, setReportId] = useState<string | null>(null);



    useEffect(() => {
        loadReport();
    }, [year, quarter, selectedDistributor, currentUser]);

    useEffect(() => {
        loadDashboard();
    }, [selectedDistributor, year, currentUser]);

    useEffect(() => {
        if (hasAccess) {
            fetchDistributors().then((res) => setDistributors(res?.distributors || []));
        }
    }, [currentUser]);

    const loadReport = () => {
        if (!hasAccess || !selectedDistributor) return;

        const url = `/purchase-reports/fetch?year=${year}&quarter=${quarter}&distributorId=${selectedDistributor}`;

        fetchReport({ url, method: "GET" })
            .then((data) => {
                if (!data) {
                    setReportId(null);
                    setLastYearSales(0);
                    setPurchases(0);
                    setBudget(0);
                    setActualSales(0);
                    setTotalPos(0);
                    setNewOpenings(0);
                    setNewOpeningsTarget(0);
                    setTotalYearVsLastYear(0);
                    setTotalYearVsBudget(0);
                    return;
                }
                setReportId(data.id || null);
                setLastYearSales(Number(data.last_year_sales) || 0);
                setPurchases(Number(data.purchases) || 0);
                setBudget(Number(data.budget) || 0);
                setActualSales(Number(data.actual_sales) || 0);
                setTotalPos(data.total_pos || 0);
                setNewOpenings(data.new_openings || 0);
                setNewOpeningsTarget(data.new_openings_target || 0);
                setTotalYearVsLastYear(data.totalYearVsLastYear || 0);
                setTotalYearVsBudget(data.totalYearVsBudget || 0);
            })
            .catch((error) => {
                console.error("Failed to fetch purchase report:", error);
                setReportId(null);
                setLastYearSales(0);
                setPurchases(0);
                setBudget(0);
                setActualSales(0);
                setTotalPos(0);
                setNewOpenings(0);
                setNewOpeningsTarget(0);
                setTotalYearVsLastYear(0);
                setTotalYearVsBudget(0);
            });
    };
    const loadDashboard = () => {
        if (!hasAccess || !selectedDistributor) return;

        fetchDashboard({
            url: `/purchase-reports/dashboard?distributorId=${selectedDistributor}&year=${year}`,
            method: "GET"
        })
            .then((data) => {
                setDashboardData(data || []);
            })
            .catch(() => {
                setDashboardData([]);
            });
    };
    if (!hasAccess) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
                    <p className="text-grey">You don't have permission to access Purchase Reports.</p>
                    <p className="text-grey text-sm mt-2">This module is available only for Export Managers and Administrators.</p>
                </div>
            </div>
        );
    }



    const handleSave = async () => {
        if (!selectedDistributor) {
            alert("Please select a distributor first");
            return;
        }

        const payload = {
            year,
            quarter,
            last_year_sales: lastYearSales,
            purchases: purchases,
            budget: budget,
            total_pos: totalPos,
            new_openings: newOpenings,
            new_openings_target: newOpeningsTarget,
            distributorId: selectedDistributor,
        };

        try {
            const report = await postReport({
                url: "/purchase-reports",
                method: "POST",
                data: payload
            });

            if (report?.id) setReportId(report.id);
            loadReport();
            loadDashboard();
            alert("Purchase report saved successfully");
        } catch (err: any) {
            alert("Error: " + (err.message || err));
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Purchase Report</h1>
                    <p className="text-grey">Purchase and sales monitoring dashboard for Export Managers</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={!selectedDistributor}
                    className={`px-4 py-2 rounded-md text-white ${selectedDistributor
                        ? 'bg-accent-bg hover:bg-accent-hover'
                        : 'bg-gray-600 cursor-not-allowed'
                        }`}
                >
                    Save
                </button>
            </div>

            <div className="mb-4">
                <label className="text-grey mr-2">Select Distributor:</label>
                <select
                    value={selectedDistributor}
                    onChange={(e) => setSelectedDistributor(e.target.value)}
                    className="bg-bg text-white px-2 py-1 rounded"
                >
                    <option value="">-- Select Distributor --</option>
                    {distributors.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.company_name}
                        </option>
                    ))}
                </select>
            </div>

            {!selectedDistributor && (
                <div className="text-grey text-lg mt-10">
                    Please select a distributor to view or edit purchase reports
                </div>
            )}

            {selectedDistributor && (
                <>
                    <div className="bg-surface p-4 rounded-lg border border-surfaceLight mb-6">
                        <div className="flex gap-4 items-center mb-4">
                            <label className="text-grey">Year</label>
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="bg-bg text-white px-2 py-1 rounded"
                            >
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const y = new Date().getFullYear() - i;
                                    return (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    );
                                })}
                            </select>

                            <label className="text-grey">Quarter</label>
                            <select
                                value={quarter}
                                onChange={(e) => setQuarter(Number(e.target.value))}
                                className="bg-bg text-white px-2 py-1 rounded"
                            >
                                <option value={1}>Q1</option>
                                <option value={2}>Q2</option>
                                <option value={3}>Q3</option>
                                <option value={4}>Q4</option>
                            </select>

                            {reportId ? (
                                <span className="text-green-400 text-sm">Report exists</span>
                            ) : (
                                <span className="text-grey text-sm">No report yet</span>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="text-left text-grey">
                                    <tr>
                                        <th className="px-3 py-2">Metric</th>
                                        <th className="px-3 py-2">Value</th>
                                        <th className="px-3 py-2">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="text-white">
                                    <tr>
                                        <td className="px-3 py-2">Last Year Sales</td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={lastYearSales}
                                                onChange={(e) => setLastYearSales(Number(e.target.value))}
                                                className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                placeholder="45000"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-grey">Sales in same quarter last year</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">Purchases</td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={purchases}
                                                onChange={(e) => setPurchases(Number(e.target.value))}
                                                className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                placeholder="30000"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-grey">Distributor's purchases from us</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">Budget</td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={budget}
                                                onChange={(e) => setBudget(Number(e.target.value))}
                                                className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                placeholder="50000"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-grey">Planned sales target</td>
                                    </tr>
                                    <tr className="bg-surfaceLight">
                                        <td className="px-3 py-2 font-semibold">Actual Sales</td>
                                        <td className="px-3 py-2 font-semibold">{actualSales.toFixed(2)}</td>
                                        <td className="px-3 py-2 text-sm text-grey">From Sales Channels (automatic)</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">Total POS</td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={totalPos}
                                                onChange={(e) => setTotalPos(Number(e.target.value))}
                                                className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                placeholder="125"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-grey">Total points of sale</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">New Openings</td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={newOpenings}
                                                onChange={(e) => setNewOpenings(Number(e.target.value))}
                                                className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                placeholder="8"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-grey">New points opened this quarter</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">New Openings Target</td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={newOpeningsTarget}
                                                onChange={(e) => setNewOpeningsTarget(Number(e.target.value))}
                                                className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                placeholder="10"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-grey">Planned new openings</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-surfaceLight p-4 rounded">
                                <h3 className="text-white font-semibold mb-2">Year-over-Year Comparison</h3>
                                <div className={`text-2xl font-bold ${totalYearVsLastYear >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {totalYearVsLastYear >= 0 ? '+' : ''}{totalYearVsLastYear.toFixed(2)}
                                </div>
                                <p className="text-grey text-sm">vs Last Year</p>
                            </div>
                            <div className="bg-surfaceLight p-4 rounded">
                                <h3 className="text-white font-semibold mb-2">Budget Comparison</h3>
                                <div className={`text-2xl font-bold ${totalYearVsBudget >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {totalYearVsBudget >= 0 ? '+' : ''}{totalYearVsBudget.toFixed(2)}
                                </div>
                                <p className="text-grey text-sm">vs Budget</p>
                            </div>
                        </div>
                    </div>

                    {dashboardData.length > 0 && (
                        <div className="bg-surface p-4 rounded-lg border border-surfaceLight">
                            <h2 className="text-lg font-semibold text-white mb-4">Quarterly Overview - {year}</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis
                                            dataKey="quarter"
                                            stroke="#9CA3AF"
                                            tickFormatter={(value) => `Q${value}`}
                                        />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="actualSales" fill="#3B82F6" name="Actual Sales" />
                                        <Bar dataKey="budget" fill="#10B981" name="Budget" />
                                        <Bar dataKey="lastYearSales" fill="#F59E0B" name="Last Year Sales" />
                                        <Bar dataKey="purchases" fill="#8B5CF6" name="Purchases" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}