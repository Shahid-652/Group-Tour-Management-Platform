import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const MEDIA_TYPES = [
  { value: "photo", label: "Photos" },
  { value: "video", label: "Video" },
  { value: "mixed", label: "Photos & video" },
  { value: "other", label: "Other" },
];

const mediaBadge = {
  photo: "bg-gold/20 text-gold",
  video: "bg-coral/20 text-coral",
  mixed: "bg-lagoon/20 text-lagoon",
  other: "bg-white/10 text-sand/60",
};

export default function Memories() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [memoriesByGroup, setMemoriesByGroup] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ title: "", driveLink: "", mediaType: "mixed", note: "" });

  const loadAll = () => {
    setLoading(true);
    api.get("/groups").then(async (res) => {
      setGroups(res.data.groups);
      const entries = await Promise.all(
        res.data.groups.map((g) => api.get(`/memories/group/${g._id}`).then((r) => [g._id, r.data.memories]))
      );
      setMemoriesByGroup(Object.fromEntries(entries));
      setLoading(false);
    });
  };

  useEffect(loadAll, []);

  const openForm = (groupId) => {
    setActiveGroupId(groupId);
    setError("");
    setForm({ title: "", driveLink: "", mediaType: "mixed", note: "" });
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/memories", { group: activeGroupId, ...form });
      setActiveGroupId(null);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not share this link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/memories/${id}`);
    loadAll();
  };

  const totalLinks = Object.values(memoriesByGroup).reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="label-eyebrow mb-2">After the tour</p>
          <h1 className="font-display text-4xl">Trip memories, all in one place</h1>
          <p className="text-sand/50 mt-2 max-w-xl">
            Once the trip wraps up, drop a Google Drive (or any) link to your photos and videos so the whole crew can find them later.
          </p>
        </div>
        {!loading && groups.length > 0 && (
          <div className="text-sand/60 text-sm">
            <strong className="text-sand">{totalLinks}</strong> link{totalLinks === 1 ? "" : "s"} shared
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sand/50">Loading…</p>
      ) : groups.length === 0 ? (
        <div className="card p-10 text-center text-sand/60">
          Join or create a group first, then come back here to share tour photos and videos.
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((g) => {
            const memories = memoriesByGroup[g._id] || [];
            return (
              <section key={g._id}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: g.coverColor || "#2DD4BF" }}
                    />
                    <h2 className="font-display text-xl">{g.name}</h2>
                    <Link to={`/groups/${g._id}`} className="text-lagoon text-sm hover:underline ml-2">
                      Open group →
                    </Link>
                  </div>
                  <button className="btn-primary" onClick={() => openForm(g._id)}>
                    + Share a drive link
                  </button>
                </div>

                {memories.length === 0 ? (
                  <p className="text-sand/40 text-sm">No photos or videos shared here yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {memories.map((m) => (
                      <div key={m._id} className="card p-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{m.title}</p>
                            <p className="text-sand/40 text-xs mt-0.5">
                              Shared by {m.addedBy?.name || "a member"} · {new Date(m.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-xs rounded-full px-3 py-1 font-medium whitespace-nowrap ${mediaBadge[m.mediaType] || mediaBadge.other}`}>
                            {MEDIA_TYPES.find((t) => t.value === m.mediaType)?.label || "Other"}
                          </span>
                        </div>
                        {m.note && <p className="text-sand/60 text-sm">{m.note}</p>}
                        <div className="flex items-center justify-between mt-1">
                          <a
                            href={m.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lagoon text-sm font-medium hover:underline"
                          >
                            Open drive link →
                          </a>
                          {(user?._id === m.addedBy?._id || user?._id === g.owner?._id) && (
                            <button
                              onClick={() => handleDelete(m._id)}
                              className="text-sand/40 text-xs hover:text-coral"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {activeGroupId && (
        <Modal onClose={() => setActiveGroupId(null)} title="Share a drive link">
          <form onSubmit={handleShare} className="space-y-4">
            {error && <p className="text-coral text-sm">{error}</p>}
            <div>
              <label className="label-eyebrow block mb-1.5">Title</label>
              <input
                required
                className="input-field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Day 2 — beach photos"
              />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Drive link</label>
              <input
                required
                type="url"
                className="input-field"
                value={form.driveLink}
                onChange={(e) => setForm({ ...form, driveLink: e.target.value })}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">What's in it?</label>
              <select
                className="input-field"
                value={form.mediaType}
                onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Note (optional)</label>
              <textarea
                className="input-field"
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Anything the group should know before opening it"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Sharing…" : "Share link"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-night/80 backdrop-blur-sm flex items-center justify-center px-6 z-30">
      <div className="card p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-sand/50 hover:text-coral">
          ✕
        </button>
        <h2 className="font-display text-2xl mb-5">{title}</h2>
        {children}
      </div>
    </div>
  );
}
