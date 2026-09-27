import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const TABS = ["Overview", "Trips", "Expenses", "Tasks", "Members", "Memories"];
const CATEGORIES = ["food", "transport", "accommodation", "activities", "other"];
const MEDIA_TYPES = [
  { value: "photo", label: "Photos" },
  { value: "video", label: "Video" },
  { value: "mixed", label: "Photos & video" },
  { value: "other", label: "Other" },
];

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [tasks, setTasks] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get(`/groups/${id}`),
      api.get(`/trips/group/${id}`),
      api.get(`/expenses/group/${id}`),
      api.get(`/expenses/group/${id}/balances`),
      api.get(`/tasks/group/${id}`),
      api.get(`/memories/group/${id}`),
    ])
      .then(([g, tr, ex, bal, tk, mem]) => {
        setGroup(g.data.group);
        setTrips(tr.data.trips);
        setExpenses(ex.data.expenses);
        setBalances(bal.data.balances);
        setTasks(tk.data.tasks);
        setMemories(mem.data.memories);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load this group"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const isOwner = group && user && group.owner?._id === user._id;
  const memberName = (userId) => group?.members.find((m) => m.user._id === userId)?.user.name || "Member";

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6 py-10 text-sand/50">Loading group…</div>;
  }

  if (error || !group) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="card p-10 text-center">
          {error || "Group not found"}
          <div className="mt-4">
            <Link to="/groups" className="btn-primary">Back to groups</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="label-eyebrow mb-1">Group</p>
          <h1 className="font-display text-4xl">{group.name}</h1>
          <p className="text-sand/50 mt-1">{group.description || "No description yet."}</p>
        </div>
        <div className="card px-5 py-3 text-center">
          <p className="label-eyebrow mb-1">Invite code</p>
          <p className="font-mono font-semibold text-lagoon tracking-widest">{group.inviteCode}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-night/10 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              activeTab === tab ? "border-coral text-night" : "border-transparent text-sand/50 hover:text-night"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && <OverviewTab group={group} trips={trips} tasks={tasks} expenses={expenses} memories={memories} />}
      {activeTab === "Trips" && <TripsTab groupId={id} trips={trips} reload={load} />}
      {activeTab === "Expenses" && (
        <ExpensesTab groupId={id} group={group} expenses={expenses} balances={balances} memberName={memberName} reload={load} />
      )}
      {activeTab === "Tasks" && <TasksTab groupId={id} group={group} tasks={tasks} reload={load} />}
      {activeTab === "Members" && (
        <MembersTab groupId={id} group={group} isOwner={isOwner} currentUser={user} reload={load} navigate={navigate} />
      )}
      {activeTab === "Memories" && <MemoriesTab groupId={id} memories={memories} currentUser={user} group={group} reload={load} />}
    </div>
  );
}

/* ============================= OVERVIEW ============================= */
function OverviewTab({ group, trips, tasks, expenses, memories }) {
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const stats = [
    { label: "Members", value: group.members.length },
    { label: "Trips planned", value: trips.length },
    { label: "Tasks done", value: `${doneTasks}/${tasks.length}` },
    { label: "Total spent", value: `৳${totalSpent}` },
    { label: "Links shared", value: memories.length },
  ];

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card p-5">
          <p className="label-eyebrow mb-2">{s.label}</p>
          <p className="font-display text-3xl">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ============================= TRIPS ============================= */
function TripsTab({ groupId, trips, reload }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", destination: "", startDate: "", endDate: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [itemForm, setItemForm] = useState({ title: "", date: "", time: "", location: "", notes: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/trips", { group: groupId, ...form });
      setShowForm(false);
      setForm({ title: "", destination: "", startDate: "", endDate: "" });
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this trip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddItem = async (e, tripId) => {
    e.preventDefault();
    await api.post(`/trips/${tripId}/itinerary`, itemForm);
    setItemForm({ title: "", date: "", time: "", location: "", notes: "" });
    reload();
  };

  const handleRemoveItem = async (tripId, itemId) => {
    await api.delete(`/trips/${tripId}/itinerary/${itemId}`);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl">Trip schedule</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "+ Plan a trip"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 mb-5 space-y-4">
          {error && <p className="text-coral text-sm">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-eyebrow block mb-1.5">Trip title</label>
              <input required className="input-field" placeholder="Beach getaway"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Destination</label>
              <input required className="input-field" placeholder="Cox's Bazar"
                value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Start date</label>
              <input required type="date" className="input-field"
                value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">End date</label>
              <input required type="date" className="input-field"
                value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Saving…" : "Save trip"}
          </button>
        </form>
      )}

      {trips.length === 0 ? (
        <div className="card p-8 text-center text-sand/60">No trips planned yet.</div>
      ) : (
        <div className="space-y-3">
          {trips.map((t) => (
            <div key={t._id} className="card p-4">
              <button
                onClick={() => setExpanded(expanded === t._id ? null : t._id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <p className="font-display text-lg">{t.destination}</p>
                  <p className="text-sand/50 text-sm">
                    {t.title} · {new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xl">{expanded === t._id ? "−" : "+"}</span>
              </button>

              {expanded === t._id && (
                <div className="mt-4 pt-4 border-t border-night/10 space-y-3">
                  {t.itinerary.length === 0 ? (
                    <p className="text-sand/40 text-sm">No itinerary items yet.</p>
                  ) : (
                    t.itinerary.map((item) => (
                      <div key={item._id} className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sand/40 text-xs">
                            {new Date(item.date).toLocaleDateString()}{item.time ? ` · ${item.time}` : ""}{item.location ? ` · ${item.location}` : ""}
                          </p>
                        </div>
                        <button onClick={() => handleRemoveItem(t._id, item._id)} className="text-sand/40 text-xs hover:text-coral">
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                  <form onSubmit={(e) => handleAddItem(e, t._id)} className="grid sm:grid-cols-2 gap-2 pt-2">
                    <input required className="input-field text-sm" placeholder="Item title"
                      value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} />
                    <input required type="date" className="input-field text-sm"
                      value={itemForm.date} onChange={(e) => setItemForm({ ...itemForm, date: e.target.value })} />
                    <input className="input-field text-sm" placeholder="Time (optional)"
                      value={itemForm.time} onChange={(e) => setItemForm({ ...itemForm, time: e.target.value })} />
                    <input className="input-field text-sm" placeholder="Location (optional)"
                      value={itemForm.location} onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })} />
                    <button type="submit" className="btn-primary text-sm sm:col-span-2">+ Add itinerary item</button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================= EXPENSES ============================= */
function ExpensesTab({ groupId, group, expenses, balances, memberName, reload }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", category: "food", paidBy: group.members[0]?.user._id || "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/expenses", { group: groupId, ...form, amount: Number(form.amount) });
      setShowForm(false);
      setForm({ title: "", amount: "", category: "food", paidBy: group.members[0]?.user._id || "" });
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${expenseId}`);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl">Expenses</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "+ Add expense"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 mb-5 space-y-4">
          {error && <p className="text-coral text-sm">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-eyebrow block mb-1.5">What was it for?</label>
              <input required className="input-field" placeholder="Hotel booking"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Amount (৳)</label>
              <input required type="number" min="0" step="0.01" className="input-field" placeholder="5000"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{cap(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Paid by</label>
              <select className="input-field" value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })}>
                {group.members.map((m) => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
              </select>
            </div>
          </div>
          <p className="text-sand/50 text-xs">
            This expense will be split equally among all {group.members.length} group members automatically.
          </p>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Saving…" : "Save expense"}
          </button>
        </form>
      )}

      <div className="card p-5 mb-5">
        <p className="label-eyebrow mb-3">Balances</p>
        <div className="space-y-2">
          {Object.entries(balances).map(([userId, amount]) => (
            <div key={userId} className="flex items-center justify-between text-sm">
              <span>{memberName(userId)}</span>
              <span className={amount > 0 ? "text-lagoon font-medium" : amount < 0 ? "text-coral font-medium" : ""}>
                ৳{amount}
              </span>
            </div>
          ))}
        </div>
        <p className="text-sand/40 text-xs mt-3">Positive = should receive · Negative = owes the group</p>
      </div>

      {expenses.length === 0 ? (
        <div className="card p-8 text-center text-sand/60">No expenses recorded yet.</div>
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => (
            <div key={e._id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium">{e.title}</p>
                <p className="text-sand/40 text-xs">
                  {cap(e.category)} · Paid by {e.paidBy?.name} · {new Date(e.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-medium">৳{e.amount}</span>
                <button onClick={() => handleDelete(e._id)} className="text-sand/40 text-xs hover:text-coral">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================= TASKS ============================= */
function TasksTab({ groupId, group, tasks, reload }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", assignedTo: "", dueDate: "", description: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/tasks", { group: groupId, ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null });
      setShowForm(false);
      setForm({ title: "", assignedTo: "", dueDate: "", description: "" });
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    reload();
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${taskId}`);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl">Tasks</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "+ Add task"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 mb-5 space-y-4">
          {error && <p className="text-coral text-sm">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-eyebrow block mb-1.5">Task</label>
              <input required className="input-field" placeholder="Book the van"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Assign to</label>
              <select className="input-field" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {group.members.map((m) => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Due date</label>
              <input type="date" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Notes</label>
              <input className="input-field" placeholder="Optional detail"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Saving…" : "Save task"}
          </button>
        </form>
      )}

      {tasks.length === 0 ? (
        <div className="card p-8 text-center text-sand/60">No tasks assigned yet.</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t._id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sand/40 text-xs">
                  {t.assignedTo ? `Assigned to ${t.assignedTo.name}` : "Unassigned"}
                  {t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select className="input-field text-xs py-1.5" value={t.status} onChange={(e) => handleStatusChange(t._id, e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="in_progress">in progress</option>
                  <option value="done">done</option>
                </select>
                <button onClick={() => handleDelete(t._id)} className="text-sand/40 text-xs hover:text-coral">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================= MEMBERS ============================= */
function MembersTab({ groupId, group, isOwner, currentUser, reload, navigate }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!email) {
      setMsg("Email is required");
      return;
    }
    setBusy(true);
    try {
      await api.post(`/groups/${groupId}/invite-friend`, { email });
      setEmail("");
      setMsg("Added to the group!");
      reload();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not invite this email");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    await api.delete(`/groups/${groupId}/members/${userId}`);
    reload();
  };

  const handleLeave = async () => {
    if (!window.confirm("Leave this group?")) return;
    await api.delete(`/groups/${groupId}/members/${currentUser._id}`);
    navigate("/groups");
  };

  return (
    <div>
      <div className="card p-5 mb-5">
        <p className="label-eyebrow mb-3">Invite a friend by email</p>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input type="email" className="input-field flex-1" placeholder="friend@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={busy} className="btn-primary whitespace-nowrap">
            {busy ? "Inviting…" : "Invite"}
          </button>
        </form>
      </div>
      {msg && <p className="text-coral text-sm mb-4">{msg}</p>}

      <div className="space-y-2">
        {group.members.map((m) => (
          <div key={m.user._id} className="card p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: m.user.avatarColor || "#FF6B4A" }}>
                {m.user.name?.[0]?.toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium">{m.user.name}</p>
                <p className="text-sand/40 text-xs">{m.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="label-eyebrow">{m.role}</span>
              {isOwner && m.role !== "owner" && (
                <button onClick={() => handleRemove(m.user._id)} className="text-sand/40 text-xs hover:text-coral">Remove</button>
              )}
              {!isOwner && m.user._id === currentUser._id && (
                <button onClick={handleLeave} className="text-sand/40 text-xs hover:text-coral">Leave</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================= MEMORIES ============================= */
function MemoriesTab({ groupId, memories, currentUser, group, reload }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", driveLink: "", mediaType: "mixed", note: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/memories", { group: groupId, ...form });
      setShowForm(false);
      setForm({ title: "", driveLink: "", mediaType: "mixed", note: "" });
      reload();
    } catch (err) {
      setError(err.response?.data?.message || "Could not share this link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (memoryId) => {
    await api.delete(`/memories/${memoryId}`);
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl">Photos &amp; videos</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "+ Share a drive link"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 mb-5 space-y-4">
          {error && <p className="text-coral text-sm">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-eyebrow block mb-1.5">Title</label>
              <input required className="input-field" placeholder="Day 2 — beach photos"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Drive link</label>
              <input required type="url" className="input-field" placeholder="https://drive.google.com/..."
                value={form.driveLink} onChange={(e) => setForm({ ...form, driveLink: e.target.value })} />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">What's in it?</label>
              <select className="input-field" value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value })}>
                {MEDIA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Note (optional)</label>
              <input className="input-field" placeholder="Anything the group should know"
                value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Sharing…" : "Share link"}
          </button>
        </form>
      )}

      {memories.length === 0 ? (
        <div className="card p-8 text-center text-sand/60">No photos or videos shared yet.</div>
      ) : (
        <div className="space-y-2">
          {memories.map((m) => (
            <div key={m._id} className="card p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium">{m.title}</p>
                <p className="text-sand/40 text-xs">
                  Shared by {m.addedBy?.name || "a member"} · {new Date(m.createdAt).toLocaleDateString()}
                </p>
                {m.note && <p className="text-sand/50 text-sm mt-1">{m.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <a href={m.driveLink} target="_blank" rel="noopener noreferrer" className="text-lagoon text-sm font-medium hover:underline whitespace-nowrap">
                  Open →
                </a>
                {(currentUser?._id === m.addedBy?._id || currentUser?._id === group.owner?._id) && (
                  <button onClick={() => handleDelete(m._id)} className="text-sand/40 text-xs hover:text-coral">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
