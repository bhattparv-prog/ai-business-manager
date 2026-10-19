"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  X,
  FileSpreadsheet,
  CheckCircle,
} from "lucide-react";

interface RecordExplorerProps {
  slug: string;
}

export default function RecordExplorerClient({ slug }: RecordExplorerProps) {
  const [collection, setCollection] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    setPage(1);
    fetchRecords();
  }, [slug, search]);

  async function fetchRecords() {
    setLoading(true);
    try {
      const res = await fetch(`/api/collections/${slug}/records?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setCollection(data.collection);
        setRecords(data.records || []);
      }
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    const initial: Record<string, any> = {};
    if (collection?.fields) {
      for (const f of collection.fields) {
        initial[f.key] = f.defaultValue || "";
      }
    }
    setFormData(initial);
    setEditRecord(null);
    setShowAddModal(true);
  }

  function openEditModal(record: any) {
    setEditRecord(record);
    const initial: Record<string, any> = {};
    if (collection?.fields) {
      for (const f of collection.fields) {
        initial[f.key] = record[f.key] !== undefined ? record[f.key] : "";
      }
    }
    setFormData(initial);
    setShowAddModal(true);
  }

  async function handleSaveRecord(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const isEdit = !!editRecord;
      const url = isEdit
        ? `/api/collections/${slug}/records/${editRecord.id}`
        : `/api/collections/${slug}/records`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save record");
        return;
      }

      setShowAddModal(false);
      setFeedback(isEdit ? "Record updated successfully" : "New record saved & automation triggered!");
      setTimeout(() => setFeedback(null), 4000);
      fetchRecords();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteRecord(id: string) {
    if (!confirm("Delete this record permanently?")) return;

    try {
      const res = await fetch(`/api/collections/${slug}/records/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchRecords();
      }
    } catch (err) {
      console.error(err);
    }
  }

  function exportCSV() {
    if (!collection || records.length === 0) {
      alert("No records to export.");
      return;
    }

    const headers = collection.fields.map((f: any) => f.name);
    const keys = collection.fields.map((f: any) => f.key);

    const rows = records.map((r) =>
      keys
        .map((k: string) => {
          const val = r[k] !== undefined ? String(r[k]) : "";
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${slug}-records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/collections"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-850 hover:border-orange-300 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>{collection?.name || slug}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
                {records.length} Records
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {collection?.description || "Dynamic records explorer"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-orange-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-orange-500" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/sources"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-orange-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Data</span>
          </Link>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search records across all fields..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm"
        />
      </div>

      {/* Dynamic Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
              <tr>
                {collection?.fields?.map((f: any) => (
                  <th key={f.key} className="py-3 px-4">
                    {f.name}
                  </th>
                ))}
                <th className="py-3 px-4 text-slate-400">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No records found matching your query.
                  </td>
                </tr>
              ) : (
                records
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((rec) => (
                    <tr key={rec.id} className="hover:bg-orange-50/30 transition-colors">
                      {collection?.fields?.map((f: any) => (
                        <td key={f.key} className="py-3 px-4 text-slate-800">
                          {renderFieldValue(rec[f.key], f.type)}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(rec)}
                          className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                          title="Edit record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {records.length > 0 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>
                Showing <span className="font-bold text-slate-900">{(page - 1) * pageSize + 1}</span> to{" "}
                <span className="font-bold text-slate-900">
                  {Math.min(page * pageSize, records.length)}
                </span>{" "}
                of <span className="font-bold text-slate-900">{records.length.toLocaleString()}</span> records
              </span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-300 disabled:opacity-40 disabled:hover:border-slate-200 font-semibold text-xs"
              >
                Previous
              </button>
              <span className="px-3 py-1 font-bold text-slate-700">
                Page {page} of {Math.ceil(records.length / pageSize) || 1}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(Math.ceil(records.length / pageSize) || 1, p + 1))
                }
                disabled={page >= Math.ceil(records.length / pageSize)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-300 disabled:opacity-40 disabled:hover:border-slate-200 font-semibold text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Add / Edit Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editRecord ? "Edit Record" : `Add Record to ${collection?.name}`}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="mt-4 space-y-3.5">
              {collection?.fields?.map((f: any) => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {f.name} {f.isRequired && <span className="text-orange-600">*</span>}
                  </label>
                  {renderInputField(f, formData[f.key], (val) =>
                    setFormData({ ...formData, [f.key]: val })
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editRecord ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function renderFieldValue(val: any, type: string) {
  if (val === undefined || val === null || val === "") return <span className="text-slate-400">—</span>;

  if (type === "boolean") {
    return val ? (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
        YES
      </span>
    ) : (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
        NO
      </span>
    );
  }

  if (type === "select") {
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
        {String(val)}
      </span>
    );
  }

  if (type === "number") {
    return <span className="font-mono font-semibold text-slate-800">{Number(val).toLocaleString()}</span>;
  }

  return <span className="font-medium text-slate-800">{String(val)}</span>;
}

function renderInputField(field: any, value: any, onChange: (val: any) => void) {
  const currentVal = value !== undefined ? value : "";

  if (field.type === "select") {
    let options: string[] = [];
    try {
      options = JSON.parse(field.options || "[]");
    } catch {}

    return (
      <select
        required={field.isRequired}
        value={currentVal}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-850 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
      >
        <option value="">Select option...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        required={field.isRequired}
        value={currentVal}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-850 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2 cursor-pointer mt-1">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded text-orange-500 focus:ring-0 w-4 h-4 bg-slate-100 border-slate-300"
        />
        <span className="text-xs font-semibold text-slate-700">Enabled / Active</span>
      </label>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      required={field.isRequired}
      value={currentVal}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-850 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
    />
  );
}
