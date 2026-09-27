import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Tasks() {
  const [groups, setGroups] = useState([]);
  const [tasksByGroup, setTasksByGroup] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/groups").then(async (res) => {
      setGroups(res.data.groups);
      const entries = await Promise.all(
        res.data.groups.map((g) => api.get(`/tasks/group/${g._id}`).then((r) => [g._id, r.data.tasks]))
      );
      setTasksByGroup(Object.fromEntries(entries));
      setLoading(false);
    });
  }, []);

  const statusStyles = {
    pending: "bg-white/10 text-sand/60",
    in_progress: "bg-gold/20 text-gold",
    done: "bg-lagoon/20 text-lagoon",
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <p className="label-eyebrow mb-2">Tasks</p>
      <h1 className="font-display text-4xl mb-8">Everything on your plate, across every trip</h1>

      {loading ? (
        <p className="text-sand/50">Loading tasks…</p>
      ) : groups.length === 0 ? (
        <div className="card p-10 text-center text-sand/60">Join or create a group to start assigning tasks.</div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g._id}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-xl">{g.name}</h2>
                <Link to={`/groups/${g._id}`} className="text-lagoon text-sm hover:underline">
                  Open group →
                </Link>
              </div>
              {(tasksByGroup[g._id] || []).length === 0 ? (
                <p className="text-sand/40 text-sm">No tasks yet in this group.</p>
              ) : (
                <div className="space-y-2">
                  {tasksByGroup[g._id].map((t) => (
                    <div key={t._id} className="card p-4 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-medium">{t.title}</p>
                        <p className="text-sand/40 text-xs">
                          {t.assignedTo ? `Assigned to ${t.assignedTo.name}` : "Unassigned"}
                          {t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <span className={`text-xs rounded-full px-3 py-1.5 font-medium ${statusStyles[t.status]}`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
