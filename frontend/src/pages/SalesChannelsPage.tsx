/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useApi } from "../hooks/useApi";
import { UploadCloud, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type SkuRow = { id?: string; sku: string; month: number; sales_quantity?: number; sales_value?: number; quantity?: number; value?: number };
type ClientRow = { id?: string; channel: string; client_name: string };
type Distributor = { id: string; company_name: string };

export default function SalesChannelsPage() {
    const { currentUser } = useAuth();

    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [quarter, setQuarter] = useState<number>(1);

    const [professionalSales, setProfessionalSales] = useState<number>(0);
    const [pharmacySales, setPharmacySales] = useState<number>(0);
    const [ecomB2cSales, setEcomB2cSales] = useState<number>(0);
    const [ecomB2bSales, setEcomB2bSales] = useState<number>(0);
    const [thirdPartySales, setThirdPartySales] = useState<number>(0);
    const [otherSales, setOtherSales] = useState<number>(0);
    const [newClientsCount, setNewClientsCount] = useState<number>(0);

    const [skuLines, setSkuLines] = useState<SkuRow[]>([]);
    const [clients, setClients] = useState<ClientRow[]>([]);
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [selectedDistributor, setSelectedDistributor] = useState<string>("");

    const { fetch: postReport } = useApi<any>(null);
    const { fetch: importFile } = useApi<any>(null);
    const { fetch: fetchDistributors } = useApi<{ distributors: Distributor[] }>({ url: "/distributors", method: "GET" });
    const { fetch: fetchReport } = useApi<any>(null);
    const { fetch: addClientApi } = useApi<any>(null);
    const { fetch: addSkuApi } = useApi<any>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [reportId, setReportId] = useState<string | null>(null);

    const total = useMemo(() => {
        return (
            Number(professionalSales || 0) +
            Number(pharmacySales || 0) +
            Number(ecomB2cSales || 0) +
            Number(ecomB2bSales || 0) +
            Number(thirdPartySales || 0) +
            Number(otherSales || 0)
        );
    }, [professionalSales, pharmacySales, ecomB2cSales, ecomB2bSales, thirdPartySales, otherSales]);

    useEffect(() => {
        if (currentUser && ["ADMIN", "SUPER_ADMIN", "EXPORT_MANAGER"].includes(currentUser.role)) {
            fetchDistributors().then((res) => setDistributors(res?.distributors || []));
        }
    }, [currentUser]);

    const loadReport = () => {
        if (!currentUser) return;

        let url = `/sales-channels/fetch?year=${year}&quarter=${quarter}`;
        if (["ADMIN", "SUPER_ADMIN", "EXPORT_MANAGER"].includes(currentUser.role) && selectedDistributor) {
            url += `&distributorId=${selectedDistributor}`;
        }

        fetchReport({ url, method: "GET" })
            .then((data) => {
                if (!data) return;
                setReportId(data.id || null);
                setProfessionalSales(data.professional_sales || 0);
                setPharmacySales(data.pharmacy_sales || 0);
                setEcomB2cSales(data.ecommerce_b2c_sales || 0);
                setEcomB2bSales(data.ecommerce_b2b_sales || 0);
                setThirdPartySales(data.third_party_sales || 0);
                setOtherSales(data.other_sales || 0);
                setNewClientsCount(data.new_clients || 0);
                setSkuLines(data.skuReports || []);
                setClients(data.clients || []);
            })
            .catch(() => {
                setReportId(null);
                setProfessionalSales(0);
                setPharmacySales(0);
                setEcomB2cSales(0);
                setEcomB2bSales(0);
                setThirdPartySales(0);
                setOtherSales(0);
                setNewClientsCount(0);
                setSkuLines([]);
                setClients([]);
            });
    };

    useEffect(() => {
        loadReport();
    }, [year, quarter, selectedDistributor, currentUser]);

    const handleAddSku = () => {
        setSkuLines((prev) => [...prev, { sku: "", month: 1,  quantity: 0, value: 0 }]);
    };

    const handleRemoveSku = (index: number) => {
        setSkuLines((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSkuChange = (index: number, partial: Partial<SkuRow>) => {
        setSkuLines((prev) => prev.map((r, i) => (i === index ? { ...r, ...partial } : r)));
    };

    const handleAddClient = () => {
        setClients((prev) => [...prev, { channel: "", client_name: "" }]);
    };

    const handleRemoveClient = (index: number) => {
        setClients((prev) => prev.filter((_, i) => i !== index));
    };

    const handleClientChange = (index: number, partial: Partial<ClientRow>) => {
        setClients((prev) => prev.map((c, i) => (i === index ? { ...c, ...partial } : c)));
    };

    const handleSave = async () => {
        const payload = {
            year,
            quarter,
            professional_sales: professionalSales,
            pharmacy_sales: pharmacySales,
            ecommerce_b2c_sales: ecomB2cSales,
            ecommerce_b2b_sales: ecomB2bSales,
            third_party_sales: thirdPartySales,
            other_sales: otherSales,
            new_clients: newClientsCount,
            distributorId:
                currentUser?.role === "DISTRIBUTOR" || currentUser?.role === "EMPLOYEE" ? undefined : selectedDistributor,
        };
        try {
            const report = await postReport({ url: "/sales-channels", method: "POST", data: payload });
            if (report?.id) setReportId(report.id);

            for (const client of clients) {
                if (!client.id && report?.id) {
                    await addClientApi({
                        url: "/sales-channels/clients",
                        method: "POST",
                        data: { ...client, reportId: report.id },
                    });
                }
            }

            for (const sku of skuLines) {
                if (!sku.id && report?.id) {
                    await addSkuApi({
                        url: "/sales-channels/sku",
                        method: "POST",
                        data: {
                            reportId: report.id,
                            sku: sku.sku,
                            month: sku.month,
                            sales_quantity: sku.quantity ?? sku.sales_quantity,
                            sales_value: sku.value ?? sku.sales_value,
                        },
                    });
                }
            }

            loadReport();

            alert("Saved");
        } catch (err: any) {
            alert("Error: " + (err.message || err));
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        const form = new FormData();
        form.append("file", f);
        try {
            await importFile({
                url: "/sales-channels/import",
                method: "POST",
                data: form,
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Import successful");
            loadReport();
        } catch (err: any) {
            alert("Import failed: " + (err.message || err));
        } finally {
            e.target.value = "";
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sales Channels</h1>
                    <p className="text-grey">Quarterly sales reporting across channels</p>
                </div>

                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 bg-surfaceLight px-3 py-2 rounded-md cursor-pointer">
                        <UploadCloud className="w-5 h-5 text-white" />
                        <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                        <span className="text-white text-sm">Import CSV</span>
                    </label>
                    <button
                        onClick={handleSave}
                        className="bg-accent-bg hover:bg-accent-hover text-white px-4 py-2 rounded-md"
                    >
                        Save
                    </button>
                </div>
            </div>

            {currentUser && ["ADMIN", "SUPER_ADMIN", "EXPORT_MANAGER"].includes(currentUser.role) && (
                <div className="mb-4">
                    <label className="text-grey mr-2">Select Distributor:</label>
                    <select
                        value={selectedDistributor}
                        onChange={(e) => setSelectedDistributor(e.target.value)}
                        className="bg-bg text-white px-2 py-1 rounded"
                    >
                        <option value="">-- Select --</option>
                        {distributors.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.company_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {currentUser &&
                ["ADMIN", "SUPER_ADMIN", "EXPORT_MANAGER"].includes(currentUser.role) &&
                !selectedDistributor && (
                    <div className="text-grey text-lg mt-10">Pick a distributor to view or edit reports</div>
                )}

            {(!["ADMIN", "SUPER_ADMIN", "EXPORT_MANAGER"].includes(currentUser?.role || "") ||
                selectedDistributor) && (
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

                                <div className="ml-auto text-grey">
                                    Total (PLN):{" "}
                                    <span className="text-white font-semibold ml-2">{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="text-left text-grey">
                                        <tr>
                                            <th className="px-3 py-2">Channel</th>
                                            <th className="px-3 py-2">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white">
                                        <tr>
                                            <td className="px-3 py-2">Professional sales</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={professionalSales}
                                                    onChange={(e) => setProfessionalSales(Number(e.target.value))}
                                                    className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2">Pharmacy sales</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={pharmacySales}
                                                    onChange={(e) => setPharmacySales(Number(e.target.value))}
                                                    className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2">E-commerce B2C</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={ecomB2cSales}
                                                    onChange={(e) => setEcomB2cSales(Number(e.target.value))}
                                                    className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2">E-commerce B2B</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={ecomB2bSales}
                                                    onChange={(e) => setEcomB2bSales(Number(e.target.value))}
                                                    className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2">Third party</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={thirdPartySales}
                                                    onChange={(e) => setThirdPartySales(Number(e.target.value))}
                                                    className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2">Other</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={otherSales}
                                                    onChange={(e) => setOtherSales(Number(e.target.value))}
                                                    className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2">New clients</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={newClientsCount}
                                                    onChange={(e) => setNewClientsCount(Number(e.target.value))}
                                                    className="bg-bg rounded px-2 py-1 w-40 text-white"
                                                />
                                            </td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="px-3 py-2 font-semibold">Total</td>
                                            <td className="px-3 py-2 font-semibold text-white">{total.toFixed(2)} PLN</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-semibold text-white">Clients (optional)</h2>
                                <button
                                    onClick={handleAddClient}
                                    className="bg-surfaceLight px-3 py-1 rounded text-white flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add Client
                                </button>
                            </div>

                            <div className="bg-surface p-3 rounded border border-surfaceLight">
                                {clients.length === 0 && <div className="text-grey">No clients added</div>}
                                {clients.map((c, idx) => (
                                    <div key={idx} className="flex gap-2 items-center mb-2">
                                        <select
                                            value={c.channel}
                                            onChange={(e) => handleClientChange(idx, { channel: e.target.value })}
                                            className="bg-bg text-white px-2 py-1 rounded w-40"
                                        >
                                            <option value="">-- Select channel --</option>
                                            <option value="Professional">Professional</option>
                                            <option value="Pharmacy">Pharmacy</option>
                                            <option value="Ecommerce B2C">Ecommerce B2C</option>
                                            <option value="Ecommerce B2B">Ecommerce B2B</option>
                                            <option value="Third party">Third party</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <input
                                            placeholder="Client name"
                                            value={c.client_name}
                                            onChange={(e) => handleClientChange(idx, { client_name: e.target.value })}
                                            className="bg-bg text-white px-2 py-1 rounded w-60"
                                        />
                                        <button
                                            onClick={() => handleRemoveClient(idx)}
                                            className="bg-red-600 px-2 py-1 rounded text-white"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-semibold text-white">Monthly SKU reporting (optional)</h2>
                                <button
                                    onClick={handleAddSku}
                                    className="bg-surfaceLight px-3 py-1 rounded text-white flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add SKU
                                </button>
                            </div>

                            <div className="bg-surface p-3 rounded border border-surfaceLight">
                                {skuLines.length === 0 && <div className="text-grey">No SKU rows</div>}
                                {skuLines.map((s, idx) => (
                                    <div key={idx} className="flex gap-2 items-center mb-2">
                                        <input
                                            placeholder="SKU"
                                            value={s.sku}
                                            onChange={(e) => handleSkuChange(idx, { sku: e.target.value })}
                                            className="bg-bg text-white px-2 py-1 rounded w-40"
                                        />
                                        <input
                                            type="number"
                                            value={s.month}
                                            min={1}
                                            max={12}
                                            onChange={(e) => handleSkuChange(idx, { month: Number(e.target.value) })}
                                            className="bg-bg text-white px-2 py-1 rounded w-20"
                                        />
                                        <input
                                            type="number"
                                            value={s.quantity ?? s.sales_quantity}
                                            onChange={(e) => handleSkuChange(idx, { quantity: Number(e.target.value) })}
                                            className="bg-bg text-white px-2 py-1 rounded w-24"
                                        />
                                        <input
                                            type="number"
                                            value={s.value ?? s.sales_value}
                                            onChange={(e) => handleSkuChange(idx, { value: Number(e.target.value) })}
                                            className="bg-bg text-white px-2 py-1 rounded w-32"
                                        />
                                        <button
                                            onClick={() => handleRemoveSku(idx)}
                                            className="bg-red-600 px-2 py-1 rounded text-white"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>)}
        </div>

    );
}
