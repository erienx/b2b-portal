/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import type { ExportManager } from "../types/common";

type Props = {
    exportManagers: ExportManager[];
    onClose: () => void;
    onCreate: (form: {
        exportManagerId: string;
        substituteId: string;
        startDate: string;
        endDate: string;
    }) => Promise<void>;
};

export default function SubstitutionModal({ exportManagers, onClose, onCreate }: Props) {
    const [form, setForm] = useState({
        exportManagerId: "",
        substituteId: "",
        startDate: "",
        endDate: "",
    });

    const handleSubmit = async () => {
        if (!form.exportManagerId || !form.substituteId || !form.startDate || !form.endDate) {
            alert("Please fill all fields");
            return;
        }
        if (new Date(form.startDate) >= new Date(form.endDate)) {
            alert("Start date must be before end date");
            return;
        }

        await onCreate(form);
        setForm({ exportManagerId: "", substituteId: "", startDate: "", endDate: "" });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
            <div className="bg-surface p-6 rounded-lg border border-surfaceLight w-full max-w-md">
                <h2 className="text-lg font-semibold text-white mb-4">Create Substitution</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-grey mb-2">Export Manager</label>
                        <select
                            value={form.exportManagerId}
                            onChange={(e) => setForm((prev) => ({ ...prev, exportManagerId: e.target.value }))}
                            className="w-full bg-bg text-white px-3 py-2 rounded border border-surfaceLight focus:border-accent-bg focus:outline-none"
                        >
                            <option value="">Select Export Manager</option>
                            {exportManagers.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.first_name} {manager.last_name} ({manager.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-grey mb-2">Substitute</label>
                        <select
                            value={form.substituteId}
                            onChange={(e) => setForm((prev) => ({ ...prev, substituteId: e.target.value }))}
                            className="w-full bg-bg text-white px-3 py-2 rounded border border-surfaceLight focus:border-accent-bg focus:outline-none"
                        >
                            <option value="">Select Substitute</option>
                            {exportManagers
                                .filter((m) => m.id !== form.exportManagerId)
                                .map((manager) => (
                                    <option key={manager.id} value={manager.id}>
                                        {manager.first_name} {manager.last_name} ({manager.email})
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-grey mb-2">Start Date</label>
                        <input
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                            className="w-full bg-bg text-white px-3 py-2 rounded border border-surfaceLight focus:border-accent-bg focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-grey mb-2">End Date</label>
                        <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                            className="w-full bg-bg text-white px-3 py-2 rounded border border-surfaceLight focus:border-accent-bg focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-accent-bg hover:bg-accent-hover rounded-md text-white"
                    >
                        Create
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-surfaceLight hover:bg-surface rounded-md text-white"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
