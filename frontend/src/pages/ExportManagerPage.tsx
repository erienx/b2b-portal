/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, Calendar, Users, TrendingUp, Building, Search } from "lucide-react";
import api from "../api/axios";

type DistributorOverview = {
  id: string;
  company_name: string;
  country: string;
  currency: string;
  is_active: boolean;
  exportManager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  latestSalesData?: {
    year: number;
    quarter: number;
    totalSales: number;
    totalSalesEur: number;
  };
  latestPurchaseData?: {
    year: number;
    quarter: number;
    actualSales: number;
    budget: number;
    totalPos: number;
  };
};

type Substitution = {
  id: string;
  exportManager: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  substitute: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  start_date: string;
  end_date: string;
  is_active: boolean;
  createdBy?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
};

type ExportManager = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export default function ExportManagerPage() {
  const { currentUser } = useAuth();

  const hasAccess = currentUser && ["EXPORT_MANAGER", "ADMIN", "SUPER_ADMIN"].includes(currentUser.role);
  const isAdminOrSuperAdmin = currentUser && ["ADMIN", "SUPER_ADMIN"].includes(currentUser.role);

  const [distributors, setDistributors] = useState<DistributorOverview[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [exportManagers, setExportManagers] = useState<ExportManager[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedDistributor, setSelectedDistributor] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [showSubstitutionForm, setShowSubstitutionForm] = useState<boolean>(false);
  const [substitutionForm, setSubstitutionForm] = useState({
    exportManagerId: "",
    substituteId: "",
    startDate: "",
    endDate: "",
  });

  const [activeTab, setActiveTab] = useState<"overview" | "substitutions">("overview");

  const { fetch: fetchDistributors } = useApi<DistributorOverview[]>(null);
  const { fetch: fetchCountries } = useApi<string[]>(null);
  const { fetch: fetchSubstitutions } = useApi<Substitution[]>(null);
  const { fetch: fetchExportManagers } = useApi<ExportManager[]>(null);
  const { fetch: createSubstitution } = useApi<Substitution>(null);
  const { fetch: deactivateSubstitution } = useApi<void>(null);

  useEffect(() => {
    if (hasAccess) {
      loadDistributors();
      loadCountries();
      loadSubstitutions();
      if (isAdminOrSuperAdmin) {
        loadExportManagers();
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (hasAccess) {
      loadDistributors();
    }
  }, [selectedCountry, selectedDistributor]);

  const loadDistributors = async () => {
    const params = new URLSearchParams();
    if (selectedCountry) params.append('country', selectedCountry);
    if (selectedDistributor) params.append('distributorId', selectedDistributor);

    const url = `/export-manager/distributors-overview${params.toString() ? '?' + params.toString() : ''}`;

    try {
      const data = await fetchDistributors({ url, method: "GET" });
      setDistributors(data || []);
    } catch (error) {
      console.error("Failed to load distributors:", error);
      setDistributors([]);
    }
  };

  const loadCountries = async () => {
    try {
      const data = await fetchCountries({ url: "/export-manager/countries", method: "GET" });
      setCountries(data || []);
    } catch (error) {
      console.error("Failed to load countries:", error);
      setCountries([]);
    }
  };

  const loadSubstitutions = async () => {
    try {
      const data = await fetchSubstitutions({ url: "/export-manager/substitutions", method: "GET" });
      setSubstitutions(data || []);
    } catch (error) {
      console.error("Failed to load substitutions:", error);
      setSubstitutions([]);
    }
  };

  const loadExportManagers = async () => {
    try {
      const data = await fetchExportManagers({ url: "/export-manager/export-managers", method: "GET" });
      setExportManagers(data || []);
    } catch (error) {
      console.error("Failed to load export managers:", error);
      setExportManagers([]);
    }
  };

  const handleCreateSubstitution = async () => {
    if (!substitutionForm.exportManagerId || !substitutionForm.substituteId ||
      !substitutionForm.startDate || !substitutionForm.endDate) {
      alert("Please fill all fields");
      return;
    }

    if (new Date(substitutionForm.startDate) >= new Date(substitutionForm.endDate)) {
      alert("Start date must be before end date");
      return;
    }

    try {
      await createSubstitution({
        url: "/export-manager/substitutions",
        method: "POST",
        data: substitutionForm,
      });

      setShowSubstitutionForm(false);
      setSubstitutionForm({
        exportManagerId: "",
        substituteId: "",
        startDate: "",
        endDate: "",
      });
      loadSubstitutions();
      alert("Substitution created successfully");
    } catch (error: any) {
      alert("Error creating substitution: " + (error.message || error));
    }
  };

  const handleDeactivateSubstitution = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this substitution?")) return;

    try {
      await deactivateSubstitution({
        url: `/export-manager/substitutions/${id}`,
        method: "DELETE",
      });
      loadSubstitutions();
      alert("Substitution deactivated successfully");
    } catch (error: any) {
      alert("Error deactivating substitution: " + (error.message || error));
    }
  };

  const filteredDistributors = distributors.filter(d =>
    d.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.country.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleExportFull = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCountry) params.append("country", selectedCountry);
      const url = `/export-manager/csv/full?${params.toString()}`;

      const response = await api.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "distributors_full_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Failed to export full CSV");
      console.error(error);
    }
  };

  const handleExportAssigned = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDistributor) params.append("distributorIds", selectedDistributor);
      if (selectedCountry) params.append("country", selectedCountry);
      const url = `/export-manager/csv/assigned?${params.toString()}`;

      const response = await api.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "assigned_distributors_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Failed to export assigned CSV");
      console.error(error);
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-grey">You don't have permission to access Export Manager Dashboard.</p>
          <p className="text-grey text-sm mt-2">This module is available only for Export Managers and Administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Export Manager Dashboard</h1>
          <p className="text-grey">Manage distributors and substitutions</p>
        </div>

        {isAdminOrSuperAdmin && (
          <button
            onClick={() => setShowSubstitutionForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-bg hover:bg-accent-hover rounded-md text-white"
          >
            <PlusCircle className="w-4 h-4" />
            Add Substitution
          </button>
        )}
      </div>

      <div className="flex border-b border-surfaceLight mb-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium ${activeTab === "overview"
            ? "text-white border-b-2 border-accent-bg"
            : "text-grey hover:text-white"
            }`}
        >
          Distributors Overview
        </button>
        <button
          onClick={() => setActiveTab("substitutions")}
          className={`px-4 py-2 font-medium ${activeTab === "substitutions"
            ? "text-white border-b-2 border-accent-bg"
            : "text-grey hover:text-white"
            }`}
        >
          Substitutions
        </button>
      </div>

      {activeTab === "overview" && (
        <div>
          <div className="bg-surface p-4 rounded-lg border border-surfaceLight mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-grey mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search distributors..."
                  className="w-full bg-bg text-white px-3 py-2 rounded border border-surfaceLight focus:border-accent-bg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-grey mb-2">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-bg text-white px-3 py-2 rounded border border-surfaceLight focus:border-accent-bg focus:outline-none"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-grey mb-2">Distributor</label>
                <select
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                  className="w-full bg-bg text-white px-3 py-2 rounded border border-surfaceLight focus:border-accent-bg focus:outline-none"
                >
                  <option value="">All Distributors</option>
                  {distributors.map(dist => (
                    <option key={dist.id} value={dist.id}>{dist.company_name}</option>
                  ))}
                </select>
              </div>


              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedCountry("");
                    setSelectedDistributor("");
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 bg-surfaceLight hover:bg-surface text-white rounded"
                >
                  Clear Filters
                </button>
              </div>

              {isAdminOrSuperAdmin && (
                <div className="flex items-end">
                  <button
                    onClick={handleExportFull}
                    className="px-4 py-2 bg-accent-bg hover:bg-accent-hover text-white rounded"
                  >
                    Export Full CSV
                  </button>
                </div>
              )}

              {hasAccess && (
                <div className="flex items-end">
                  <button
                    onClick={handleExportAssigned}
                    disabled={Boolean(!selectedDistributor && isAdminOrSuperAdmin)}
                    className={`px-4 py-2 rounded text-white ${!selectedDistributor && isAdminOrSuperAdmin
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-accent-bg hover:bg-accent-hover"
                      }`}
                  >
                    Export Assigned CSV
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface p-4 rounded-lg border border-surfaceLight">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-grey">Total Distributors</p>
                  <p className="text-2xl font-bold text-white">{filteredDistributors.length}</p>
                </div>
                <Building className="w-8 h-8 text-accent-bg" />
              </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-surfaceLight">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-grey">Active Countries</p>
                  <p className="text-2xl font-bold text-white">{countries.length}</p>
                </div>
                <Users className="w-8 h-8 text-accent-bg" />
              </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-surfaceLight">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-grey">With Sales Data</p>
                  <p className="text-2xl font-bold text-white">
                    {filteredDistributors.filter(d => d.latestSalesData).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent-bg" />
              </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-surfaceLight">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-grey">Active Substitutions</p>
                  <p className="text-2xl font-bold text-white">
                    {substitutions.filter(s => s.is_active).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-accent-bg" />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-surfaceLight overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-surfaceLight">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                      Distributor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                      Export Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                      Latest Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                      Purchase Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-surfaceLight">
                  {filteredDistributors.map((distributor) => (
                    <tr key={distributor.id} className="hover:bg-surfaceLight">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {distributor.company_name}
                          </div>
                          <div className="text-sm text-grey">
                            {distributor.currency}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white">{distributor.country}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {distributor.exportManager ? (
                          <div>
                            <div className="text-sm text-white">
                              {distributor.exportManager.first_name} {distributor.exportManager.last_name}
                            </div>
                            <div className="text-sm text-grey">
                              {distributor.exportManager.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-grey">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {distributor.latestSalesData ? (
                          <div>
                            <div className="text-sm text-white">
                              €{distributor.latestSalesData.totalSalesEur.toLocaleString()}
                            </div>
                            <div className="text-sm text-grey">
                              {distributor.latestSalesData.year} Q{distributor.latestSalesData.quarter}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-grey">No data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {distributor.latestPurchaseData ? (
                          <div>
                            <div className="text-sm text-white">
                              Budget: €{distributor.latestPurchaseData.budget.toLocaleString()}
                            </div>
                            <div className="text-sm text-grey">
                              POS: {distributor.latestPurchaseData.totalPos}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-grey">No data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${distributor.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {distributor.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredDistributors.length === 0 && (
                <div className="text-center py-8 text-grey">
                  No distributors found matching your criteria
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "substitutions" && (
        <div>
          <div className="bg-surface rounded-lg border border-surfaceLight overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-surfaceLight">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                      Export Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                      Substitute
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                      Created By
                    </th>
                    {isAdminOrSuperAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-grey uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-surfaceLight">
                  {substitutions.map((substitution) => (
                    <tr key={substitution.id} className="hover:bg-surfaceLight">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {substitution.exportManager.first_name} {substitution.exportManager.last_name}
                          </div>
                          <div className="text-sm text-grey">
                            {substitution.exportManager.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {substitution.substitute.first_name} {substitution.substitute.last_name}
                          </div>
                          <div className="text-sm text-grey">
                            {substitution.substitute.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(substitution.start_date).toLocaleDateString()} - {new Date(substitution.end_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-grey">
                          {Math.ceil((new Date(substitution.end_date).getTime() - new Date(substitution.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${substitution.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {substitution.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {substitution.createdBy ? (
                          <span className="text-sm text-white">
                            {substitution.createdBy.first_name} {substitution.createdBy.last_name}
                          </span>
                        ) : (
                          <span className="text-sm text-grey">Unknown</span>
                        )}
                      </td>
                      {isAdminOrSuperAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {substitution.is_active && (
                            <button
                              onClick={() => handleDeactivateSubstitution(substitution.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {substitutions.length === 0 && (
                <div className="text-center py-8 text-grey">
                  No substitutions found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSubstitutionForm && isAdminOrSuperAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg border border-surfaceLight w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">Create Substitution</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-grey mb-2">Export Manager</label>
                <select
                  value={substitutionForm.exportManagerId}
                  onChange={(e) => setSubstitutionForm(prev => ({
                    ...prev,
                    exportManagerId: e.target.value
                  }))}
                  className="w-full bg-bg text-white px-3 py-2 rounded border border-surfaceLight focus:border-accent-bg focus:outline-none"
                >
                  <option value="">Select Export Manager</option>
                  {exportManagers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.first_name} {manager.last_name} ({manager.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-grey mb-2">Substitute</label>
                <select
                  value={substitutionForm.substituteId}
                  onChange={(e) => setSubstitutionForm(prev => ({
                    ...prev,
                    substituteId: e.target.value
                  }))}
                  className="w-full bg-bg text-white px-3 py-2 rounded border border-surfaceLight focus:border-accent-bg focus:outline-none"
                >
                  <option value="">Select Substitute</option>
                  {exportManagers.filter(m => m.id !== substitutionForm.exportManagerId).map(manager => (
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
                  value={substitutionForm.startDate}
                  onChange={(e) => setSubstitutionForm(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                  className="w-full bg-bg text-white px-3 py-2 rounded border border-surfaceLight focus:border-accent-bg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-grey mb-2">End Date</label>
                <input
                  type="date"
                  value={substitutionForm.endDate}
                  onChange={(e) => setSubstitutionForm(prev => ({
                    ...prev,
                    endDate: e.target.value
                  }))}
                  className="w-full bg-bg text-white px-3 py-2 rounded border border-surfaceLight focus:border-accent-bg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateSubstitution}
                className="flex-1 px-4 py-2 bg-accent-bg hover:bg-accent-hover rounded-md text-white"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowSubstitutionForm(false);
                  setSubstitutionForm({
                    exportManagerId: "",
                    substituteId: "",
                    startDate: "",
                    endDate: "",
                  });
                }}
                className="flex-1 px-4 py-2 bg-surfaceLight hover:bg-surface rounded-md text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}