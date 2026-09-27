import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const TRAVEL_IMAGES = [
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/groups")
      .then((res) => setGroups(res.data.groups))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="label-eyebrow">Your travel command center</p>
          <h1 className="font-display dashboard-title">
            Hey {user?.name?.split(" ")[0]}, where's the crew headed?
          </h1>
          <p className="dashboard-lead">
            Your groups, people and trip activity — all in one place.
          </p>
        </div>
        <div className="dashboard-hero-photo" />
      </section>

      <div className="dashboard-stats-grid">
        <StatCard label="Active groups" value={groups.length} accent="coral" icon="groups" image={TRAVEL_IMAGES[0]} />
        <StatCard
          label="Groups you own"
          value={groups.filter((g) => g.owner?._id === user?._id).length}
          accent="lagoon"
          icon="person"
          image={TRAVEL_IMAGES[1]}
        />
        <StatCard
          label="Total members reached"
          value={groups.reduce((s, g) => s + g.members.length, 0)}
          accent="gold"
          icon="star"
          image={TRAVEL_IMAGES[2]}
        />
      </div>

      <div className="section-heading-row">
        <div>
          <p className="section-kicker">Your travel network</p>
          <h2 className="font-display section-title">Your groups</h2>
        </div>
        <Link to="/groups" className="manage-link">Manage groups <span>→</span></Link>
      </div>

      {loading ? (
        <div className="page-loading">Loading your groups…</div>
      ) : groups.length === 0 ? (
        <div className="dashboard-empty">
          <div className="empty-copy">
            <p className="section-kicker">Start an adventure</p>
            <h3 className="font-display">Your next crew is waiting.</h3>
            <p>Create a group or join one with an invite code to start planning together.</p>
            <Link to="/groups" className="btn-primary">Explore groups <span>→</span></Link>
          </div>
          <div className="empty-photo" />
        </div>
      ) : (
        <div className="dashboard-groups-grid">
          {groups.map((g, index) => (
            <GroupPreview key={g._id} group={g} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent, icon, image }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-photo" style={{ backgroundImage: `url('${image}')` }} />
      <div className="stat-photo-overlay" />
      <div className="stat-card-content">
        <div className="stat-icon">{icon === "groups" ? <UsersIcon /> : icon === "person" ? <PersonIcon /> : <StarIcon />}</div>
        <p className="stat-label">{label}</p>
        <p className="stat-number">{value}</p>
        <p className="stat-caption">Wayfare network</p>
      </div>
    </div>
  );
}

function GroupPreview({ group, index }) {
  const image = TRAVEL_IMAGES[index % TRAVEL_IMAGES.length];
  return (
    <Link to={`/groups/${group._id}`} className="group-preview-card">
      <div className="group-preview-photo" style={{ backgroundImage: `url('${image}')` }}>
        <span className="group-preview-avatar" style={{ backgroundColor: group.coverColor || "#3D9B91" }}>
          {group.name?.[0]?.toUpperCase()}
        </span>
        <span className="group-preview-open">↗</span>
      </div>
      <div className="group-preview-body">
        <h3 className="font-display">{group.name}</h3>
        <p>{group.description || "No description yet."}</p>
        <div className="group-preview-meta">
          <span>{group.members.length} members</span>
          <span className="mono">{group.inviteCode}</span>
        </div>
      </div>
    </Link>
  );
}

function UsersIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.4" /><path d="M3.5 19C3.5 14.8 5.7 12 9 12C12.3 12 14.5 14.8 14.5 19" /><path d="M14.5 13.2C15.3 12.8 16.2 12.5 17 12.5C19.6 12.5 21 14.4 21 17V19" /></svg>;
}

function PersonIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4" /><path d="M4 21C4 16.5 7.2 13 12 13C16.8 13 20 16.5 20 21" /></svg>;
}

function StarIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4Z" /></svg>;
}
