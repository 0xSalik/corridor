// FacilitiesTab: lists facilities at a college, grouped by type. Students can add new ones.

"use client";

import { useState, useEffect, useReducer } from "react";

const typeLabels = {
  lab: "Lab", hostel: "Hostel", library: "Library", sports: "Sports",
  cafeteria: "Cafeteria", auditorium: "Auditorium", medical: "Medical Center",
  gym: "Gym", workshop: "Workshop", other: "Other",
};
const typeOptions = Object.entries(typeLabels);

export default function FacilitiesTab({ collegeId, isOwnCollege }) {
  const [facilities, setFacilities] = useState([]);
  const [refresh, triggerRefresh] = useReducer((x) => x + 1, 0);
  const [filterType, setFilterType] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("lab");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const url = filterType
      ? `/api/facilities?collegeId=${collegeId}&type=${filterType}`
      : `/api/facilities?collegeId=${collegeId}`;
    fetch(url).then((r) => r.json()).then((d) => { if (!cancelled && Array.isArray(d)) setFacilities(d); }).catch(() => {});
    return () => { cancelled = true; };
  }, [collegeId, filterType, refresh]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId, name, type, department: department || undefined, description: description || undefined, rating: rating || undefined }),
      });
      if (res.ok) {
        setName(""); setDescription(""); setDepartment(""); setRating(0); setShowForm(false);
        triggerRefresh();
      }
    } catch {} finally { setSubmitting(false); }
  }

  const grouped = {};
  for (const f of facilities) {
    if (!grouped[f.type]) grouped[f.type] = [];
    grouped[f.type].push(f);
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterType("")}
          className={`text-xs px-3 py-1.5 rounded-md border cursor-pointer transition-colors ${!filterType ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"}`}>
          All
        </button>
        {typeOptions.map(([val, label]) => (
          <button key={val} onClick={() => setFilterType(val)}
            className={`text-xs px-3 py-1.5 rounded-md border cursor-pointer transition-colors ${filterType === val ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Grouped list */}
      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([typeName, items]) => (
          <div key={typeName}>
            <h3 className="text-lg font-[family-name:var(--font-heading)] font-semibold mb-3 capitalize">{typeLabels[typeName] || typeName}</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {items.map((f) => (
                <div key={f._id} className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)]">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{f.name}</p>
                    {f.rating && (
                      <span className="text-sm text-[var(--color-star)] whitespace-nowrap">{"★".repeat(f.rating)}</span>
                    )}
                  </div>
                  {f.department && <p className="text-xs text-[var(--color-accent)] mt-0.5">{f.department}</p>}
                  {f.description && <p className="text-sm text-[var(--color-muted)] mt-2">{f.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-[var(--color-muted)]">No facilities listed yet.</p>
      )}

      {/* Add form (students at this college only) */}
      {isOwnCollege && (
        <>
          {!showForm ? (
            <button onClick={() => setShowForm(true)}
              className="text-sm text-[var(--color-accent)] hover:underline cursor-pointer">
              + Add a facility
            </button>
          ) : (
            <div className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-card)]">
              <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-4">Add Facility</h3>
              <form onSubmit={handleAdd} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. VLSI Lab"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]">
                      {typeOptions.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">Department (optional)</label>
                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. CSE"
                      className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">Rating (optional)</label>
                    <div className="flex gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" onClick={() => setRating(n)}
                          className={`text-lg cursor-pointer ${n <= rating ? "text-[var(--color-star)]" : "text-[var(--color-border)]"}`}>★</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-muted)] mb-1">Description (optional)</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={500}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-card)] focus:outline-none focus:border-[var(--color-accent)] resize-none" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting}
                    className="text-sm px-4 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50 cursor-pointer">
                    {submitting ? "Adding..." : "Add"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="text-sm px-4 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-muted)] cursor-pointer">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
