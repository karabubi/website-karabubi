import React from "react";
import {
  NavLink,
  Link,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import salehImage from "../assets/saleh.jpg";

function Navbar() {
  const {
    user,
    loading,
    logout,
  } = useAuth();

  const navClass = ({ isActive }) =>
    [
      "px-3 py-2 rounded-xl transition-colors",
      isActive
        ? "text-white bg-slate-800"
        : "text-slate-300 hover:text-white",
    ].join(" ");

  return (
    <header className="site-navbar">
      <div className="site-navbar-inner">

        <Link
          to="/"
          className="site-brand"
        >
          <span className="site-brand-logo">
            SA
          </span>

        </Link>

        <nav className="site-nav-links">
          <NavLink
            to="/"
            className={navClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            className={navClass}
          >
            About
          </NavLink>

          <NavLink
            to="/photos"
            className={navClass}
          >
            Projects
          </NavLink>

          <NavLink
            to="/contact"
            className={navClass}
          >
            Contact
          </NavLink>
        </nav>

        <div className="site-nav-actions">
          {!loading && user ? (
            <>
              <Link
                to="/private"
                className="nav-user"
              >
                <img
                  src={salehImage}
                  alt="Saleh Alkarabubi"
                  className="nav-user-photo"
                />

                <span className="nav-user-copy">
                  <strong>
                    {user.name || "Saleh"}
                  </strong>

                  <small>
                    Dashboard
                  </small>
                </span>
              </Link>

              <button
                type="button"
                className="nav-signout"
                onClick={logout}
              >
                Sign out
              </button>
            </>
          ) : !loading ? (
            <>
              <NavLink
                to="/login"
                className="nav-login"
              >
                Sign in
              </NavLink>

              <NavLink
                to="/register"
                className="nav-register"
              >
                Create account
              </NavLink>
            </>
          ) : null}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
