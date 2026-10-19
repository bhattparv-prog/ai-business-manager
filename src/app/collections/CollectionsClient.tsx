"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Trash2,
  FolderOpen,
  ArrowRight,
  Sparkles,
  X,
  FileSpreadsheet,
} from "lucide-react";

export default function CollectionsClient() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Collection Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<any[]>([
    { name: "Title / Name", key: "title", type: "text", isRequired: true },
  ]);

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    setLoading(true);
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } finally {
      setLoading(false);
    }
  }

  function addField() {
    setFields([
      ...fields,
      { name: "New Field", key: `field_${fields.length + 1}`, type: "text", isRequired: false },
    ]);
  }

  function updateField(index: number, key: string, value: any) {
    const updated = [...fields];
    updated[index][key] = value;
    if (key === "name" && !updated[index].customKey) {
      updated[index].key = value.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    }
    setFields(updated);
  }

  function removeField(index: number) {
    if (fields.length <= 1) return;
    setFields(fields.filter((_, idx) => idx !== index));
  }

  async function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          fields,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create collection");
        return;
      }

      setShowModal(false);
      setName("");
      setDescription("");
      setFields([{ name: "Title / Name", key: "title", type: "text", isRequired: true }]);
      fetchCollections();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(slug: string, colName: string) {
    if (!confirm(`Are you sure you want to delete collection "${colName}" and all its records?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/collections/${slug}`, { method: "DELETE" });
      if (res.ok) {
        fetchCollections();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Custom Collections</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
              {collections.length} Configured
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build bespoke data schemas for your business without fixed assumptions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Collection</span>
        </button>
      </div>

      {/* Grid of collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Loading collections...
          </div>
        ) : collections.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <Layers className="w-10 h-10 text-orange-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No collections configured yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Create a custom data collection like Customers, Inventory, Expenses, or Inquiries.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-sm"
            >
              + Create First Collection
            </button>
          </div>
        ) : (
          collections.map((col) => (
            <div
              key={col.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => handleDelete(col.slug, col.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-orange-600 transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {col.description || "Custom business records table."}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                  <span>
                    <strong className="text-slate-800">{col._count?.records || 0}</strong> records
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-800">{col.fields?.length || 0}</strong> fields
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/collections/${col.slug}`}
                  className="w-full py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-orange-200/80"
                >
                  <span>Explore & Manage Records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-slate-900 text-base">Create Custom Collection</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Invoices, Clients, Support Tickets, Assets"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Purpose of this collection"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Dynamic Field Builder */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Custom Fields Schema ({fields.length})
                  </label>
                  <button
                    type="button"
                    onClick={addField}
                    className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Field</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {fields.map((field, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs"
                    >
                      <input
                        type="text"
                        required
                        value={field.name}
                        onChange={(e) => updateField(idx, "name", e.target.value)}
                        placeholder="Field Label"
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-orange-500"
                      />

                      <select
                        value={field.type}
                        onChange={(e) => updateField(idx, "type", e.target.value)}
                        className="w-32 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-orange-500 font-medium"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="select">Dropdown</option>
                        <option value="boolean">Yes/No</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="textarea">Long Text</option>
                      </select>

                      <label className="flex items-center gap-1 text-slate-600 shrink-0 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(e) => updateField(idx, "isRequired", e.target.checked)}
                          className="rounded text-orange-500 focus:ring-orange-500/20"
                        />
                        <span>Req</span>
                      </label>

                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeField(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
