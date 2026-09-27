import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const COVER_COLORS = ["#2DD4BF", "#FF6B4A", "#F2B84B", "#8B7CF6"];

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const [createForm, setCreateForm] = useState({ name: "", description: "", coverColor: COVER_COLORS[0] });
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadGroups = () => {
    setLoading(true);
    api
      .get("/groups")
      .then((res) => setGroups(res.data.groups))
      .finally(() => setLoading(false));
  };

  useEffect(loadGroups, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/groups", createForm);
      setShowCreate(false);
      setCreateForm({ name: "", description: "", coverColor: COVER_COLORS[0] });
      loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create group");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/groups/join", { inviteCode: joinCode });
      setShowJoin(false);
      setJoinCode("");
      loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Could not join group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="label-eyebrow mb-2">Groups</p>
          <h1 className="font-display text-4xl">Every tour crew, one roof</h1>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => setShowJoin(true)}>
            Join with code
          </button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + New group
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sand/50">Loading…</p>
      ) : groups.length === 0 ? (
        <div className="card p-10 text-center text-sand/60">No groups yet. Create one to get started.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {groups.map((g) => (
            <Link to={`/groups/${g._id}`} key={g._id} className="card p-5 hover:border-lagoon/50 block">
              <div
                className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center font-display font-semibold text-night"
                style={{ backgroundColor: g.coverColor || "#2DD4BF" }}
              >
                {g.name?.[0]?.toUpperCase()}
              </div>
              <h3 className="font-display text-lg mb-1">{g.name}</h3>
              <p className="text-sand/50 text-sm mb-3 line-clamp-2">{g.description || "No description yet."}</p>
              <div className="flex -space-x-2">
                {g.members.slice(0, 5).map((m) => (
                  <span
                    key={m.user._id}
                    className="w-7 h-7 rounded-full border-2 border-night-light flex items-center justify-center text-[10px] font-semibold text-night"
                    style={{ backgroundColor: m.user.avatarColor || "#FF6B4A" }}
                    title={m.user.name}
                  >
                    {m.user.name?.[0]?.toUpperCase()}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="Create a group">
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <p className="text-coral text-sm">{error}</p>}
            <div>
              <label className="label-eyebrow block mb-1.5">Group name</label>
              <input
                required
                className="input-field"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Cox's Bazar Squad"
              />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Description</label>
              <textarea
                className="input-field"
                rows={3}
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="What's this trip about?"
              />
            </div>
            <div>
              <label className="label-eyebrow block mb-2">Cover color</label>
              <div className="flex gap-2">
                {COVER_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCreateForm({ ...createForm, coverColor: c })}
                    className={`w-8 h-8 rounded-full ${createForm.coverColor === c ? "ring-2 ring-offset-2 ring-offset-night-light ring-sand" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Creating…" : "Create group"}
            </button>
          </form>
        </Modal>
      )}

      {showJoin && (
        <Modal onClose={() => setShowJoin(false)} title="Join a group">
          <form onSubmit={handleJoin} className="space-y-4">
            {error && <p className="text-coral text-sm">{error}</p>}
            <div>
              <label className="label-eyebrow block mb-1.5">Invite code</label>
              <input
                required
                className="input-field font-mono uppercase"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="A1B2C3D4"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Joining…" : "Join group"}
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
