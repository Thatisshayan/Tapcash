"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, ToggleLeft, ToggleRight, Trash2, Loader2, Timer } from "lucide-react";

interface MultiplierEvent {
  id: string;
  label: string;
  multiplier: number;
  startsAt: { toDate: () => Date } | string;
  endsAt: { toDate: () => Date } | string;
  active: boolean;
  createdAt: { toDate: () => Date } | string;
}

function fmtDate(ts: { toDate: () => Date } | string | null | undefined): string {
  if (!ts) return "—";
  const d = typeof ts === "object" && "toDate" in ts ? ts.toDate() : new Date(ts as string);
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function isActive(e: MultiplierEvent): boolean {
  if (!e.active) return false;
  const now = Date.now();
  const start = typeof e.startsAt === "object" && "toDate" in e.startsAt ? e.startsAt.toDate().getTime() : new Date(e.startsAt as string).getTime();
  const end = typeof e.endsAt === "object" && "toDate" in e.endsAt ? e.endsAt.toDate().getTime() : new Date(e.endsAt as string).getTime();
  return now >= start && now <= end;
}

export default function MultiplierPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<MultiplierEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", multiplier: "2", startsAt: "", endsAt: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/multiplier", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/multiplier", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setShowForm(false);
      setForm({ label: "", multiplier: "2", startsAt: "", endsAt: "" });
      setMessage({ text: "Multiplier created", type: "success" });
      fetchEvents();
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleEvent(id: string, currentActive: boolean) {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/multiplier", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, active: !currentActive } : e)));
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Multipliers</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage promotional earning rate boosts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00e6c3] text-[#050816] text-sm font-black hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> New Multiplier
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-xl p-3 text-sm font-semibold ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message.text}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-white/6 bg-[#080c1a] p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-semibold block mb-1">Label</label>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Weekend Bonus" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#00e6c3]/50" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-semibold block mb-1">Multiplier (x times)</label>
              <input type="number" min="1" step="0.1" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: e.target.value })} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#00e6c3]/50" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-semibold block mb-1">Starts At</label>
              <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e6c3]/50 [color-scheme:dark]" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-semibold block mb-1">Ends At</label>
              <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e6c3]/50 [color-scheme:dark]" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00e6c3] text-[#050816] text-sm font-black hover:opacity-90 transition disabled:opacity-50">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#00e6c3]" /></div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-10 text-center">
          <Timer className="w-8 h-8 mx-auto text-zinc-600" />
          <p className="font-black text-zinc-400 mt-3">No multipliers yet</p>
          <p className="text-sm text-zinc-600">Create a promotional earning rate boost.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
            const live = isActive(event);
            return (
              <div key={event.id} className="rounded-2xl border border-white/6 bg-[#080c1a] p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-white text-sm truncate">{event.label}</p>
                    {live && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">LIVE</span>}
                    {!event.active && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-zinc-500/15 text-zinc-400 border border-zinc-500/20">DISABLED</span>}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {event.multiplier}x &middot; {fmtDate(event.startsAt)} &rarr; {fmtDate(event.endsAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleEvent(event.id, event.active)}
                    className={`p-2 rounded-xl border transition ${event.active ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-zinc-600/30 text-zinc-500 bg-white/5"}`}
                    title={event.active ? "Disable" : "Enable"}
                  >
                    {event.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
