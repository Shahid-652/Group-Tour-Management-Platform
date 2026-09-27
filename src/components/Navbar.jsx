import React from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
  },
  {
    to: "/groups",
    label: "Groups",
  },
  {
    to: "/tasks",
    label: "Tasks",
  },
  {
    to: "/memories",
    label: "Memories",
  },
];


export default function Navbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();


  if (!user) return null;


  return (
    <header className="border-b border-[#D8D0BE] bg-[#17324D]/95 backdrop-blur sticky top-0 z-20">

      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">


        {/* ==========================================
            LOGO
        ========================================== */}

        <Link
          to="/dashboard"
          className="flex items-center gap-2 group"
        >
          <span
            className="
              w-8
              h-8
              rounded-full
              bg-coral
              flex
              items-center
              justify-center
              font-display
              font-semibold
              text-white
              shadow-sm
            "
          >
            W
          </span>

          <span
            className="
              font-display
              text-xl
              tracking-tight
              text-sand
            "
          >
            Wayfare
          </span>
        </Link>


        {/* ==========================================
            NAVIGATION
        ========================================== */}

        <nav className="hidden md:flex items-center gap-1">

          {navItems.map((item) => {

            const active =
              location.pathname.startsWith(item.to);


            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  font-medium
                  transition-colors

                  ${
                    active
                      ? "bg-lagoon text-sand"
                      : "text-sand/75 hover:text-sand hover:bg-white/10"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}

        </nav>


        {/* ==========================================
            USER + LOGOUT
        ========================================== */}

        <div className="flex items-center gap-3">

          <span
            className="
              w-8
              h-8
              rounded-full
              flex
              items-center
              justify-center
              text-xs
              font-semibold
              text-white
              shadow-sm
            "
            style={{
              backgroundColor:
                user.avatarColor || "#E9683D",
            }}
            title={user.name}
          >
            {user.name?.[0]?.toUpperCase()}
          </span>


          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="
              text-sm
              text-sand/70
              hover:text-coral
              transition-colors
            "
          >
            Log out
          </button>

        </div>

      </div>

    </header>
  );
}