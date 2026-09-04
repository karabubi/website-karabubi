import React from "react";
import {
  NavLink,
  Link,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import salehImage from "../assets/saleh.jpg";

function Navbar() {
  const {
    user,
    loading,
    logout,
  } = useAuth();

  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

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
            {t.nav.home}
          </NavLink>

          <NavLink
            to="/about"
            className={navClass}
          >
            {t.nav.about}
          </NavLink>

          <NavLink
            to="/photos"
            className={navClass}
          >
            {t.nav.projects}
          </NavLink>

          <NavLink
            to="/contact"
            className={navClass}
          >
            {t.nav.contact}
          </NavLink>
        </nav>

        <div className="site-nav-actions">
          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value)
            }
            aria-label="Select language"
          >
            <option value="en">
              🇬🇧 English
            </option>

            <option value="de">
              🇩🇪 Deutsch
            </option>

            <option value="ar">
              🇸🇦 العربية
            </option>
          </select>

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
                    {t.nav.dashboard}
                  </small>
                </span>
              </Link>

              <button
                type="button"
                className="nav-signout"
                onClick={logout}
              >
                {t.nav.signOut}
              </button>
            </>
          ) : !loading ? (
            <>
              <NavLink
                to="/login"
                className="nav-login"
              >
                {t.nav.signIn}
              </NavLink>

              <NavLink
                to="/register"
                className="nav-register"
              >
                {t.nav.createAccount}
              </NavLink>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
