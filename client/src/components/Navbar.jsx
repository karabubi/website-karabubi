import React from "react";
import {
  NavLink,
  Link,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import salehImage from "../assets/saleh-nav.jpg";

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
      "rounded-xl px-3 py-2 transition-colors",
      "max-[640px]:px-2.5 max-[640px]:text-[0.9rem]",
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-300 hover:text-white",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 w-full min-h-[86px] border-b border-[#172033] bg-[rgba(2,6,23,0.96)] max-[900px]:min-h-0">
      <div className="mx-auto flex min-h-[86px] w-[min(1480px,calc(100%-48px))] flex-row flex-nowrap items-center justify-between gap-4 max-[900px]:w-[calc(100%-32px)] max-[900px]:min-h-0 max-[900px]:flex-wrap max-[900px]:gap-y-2.5 max-[900px]:py-3 max-[640px]:w-[calc(100%-24px)] max-[640px]:py-2.5 max-[420px]:w-[calc(100%-20px)]">
        <Link
          to="/"
          className="flex min-w-[64px] shrink-0 items-center gap-3 no-underline max-[900px]:min-w-0"
        >
          <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 max-[420px]:h-[42px] max-[420px]:w-[42px]">
            SA
          </span>
        </Link>

        <nav className="flex flex-1 flex-row items-center justify-center gap-1 whitespace-nowrap max-[900px]:order-3 max-[900px]:basis-full max-[900px]:overflow-x-auto max-[900px]:justify-start max-[640px]:gap-0.5 rtl:direction-rtl">
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

          <NavLink
            to="/wisdom"
            className={navClass}
          >
            {t.nav.wisdom}
          </NavLink>

            <NavLink
              to="/wisdom-poetry"
              className={navClass}
            >
              {t.nav.poetry}
            </NavLink>
<NavLink
              to="/videos"
              className={navClass}
            >
              {t.nav.videos}
            </NavLink>
<NavLink
              to="/gallery"
              className={navClass}
            >
              {t.nav.gallery}
            </NavLink>
        </nav>

        <div className="flex max-w-[720px] shrink flex-row flex-wrap items-center justify-end gap-2 whitespace-nowrap max-[900px]:ms-auto max-[900px]:min-w-0 max-[900px]:shrink max-[900px]:gap-2 max-[640px]:gap-1.5">
          <select
            className="min-h-[42px] max-w-[135px] rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-sm text-slate-200 outline-none transition-colors focus:border-blue-500 max-[640px]:min-h-10 max-[640px]:w-[58px] max-[640px]:max-w-[58px] max-[640px]:px-1 max-[420px]:w-[50px] max-[420px]:max-w-[50px]"
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
              {user.role === "admin" && (
                <>
                  <Link
                    to="/admin/wisdom"
                    className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-3.5 py-2.5 font-semibold text-blue-300 no-underline transition-colors hover:bg-blue-500/20 hover:text-blue-200 max-[1500px]:px-2.5 max-[1500px]:text-[0.82rem] max-[640px]:px-2.5 max-[640px]:py-2 max-[640px]:text-[0.82rem]"
                  >
                    {t.nav.manageWisdom}
                  </Link>

                  <Link
                    to="/admin/wisdom-poetry"
                    className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-3.5 py-2.5 font-semibold text-violet-300 no-underline transition-colors hover:bg-violet-500/20 hover:text-violet-200 max-[1500px]:px-2.5 max-[1500px]:text-[0.82rem] max-[640px]:px-2.5 max-[640px]:py-2 max-[640px]:text-[0.82rem]"
                  >
                    {t.nav.managePoetry}
                  </Link>
<Link
                    to="/admin/videos"
                    className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-3.5 py-2.5 font-semibold text-violet-300 no-underline transition-colors hover:bg-violet-500/20 hover:text-violet-200 max-[1500px]:px-2.5 max-[1500px]:text-[0.82rem] max-[640px]:px-2.5 max-[640px]:py-2 max-[640px]:text-[0.82rem]"
                  >
                    {t.nav.manageVideos}
                  </Link>
<Link
                    to="/admin/gallery"
                    className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-3.5 py-2.5 font-semibold text-violet-300 no-underline transition-colors hover:bg-violet-500/20 hover:text-violet-200 max-[1500px]:px-2.5 max-[1500px]:text-[0.82rem] max-[640px]:px-2.5 max-[640px]:py-2 max-[640px]:text-[0.82rem]"
                  >
                    {t.nav.manageGallery}
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-3.5 py-2.5 font-semibold text-blue-300 no-underline transition-colors hover:bg-blue-500/20 hover:text-blue-200 max-[1500px]:px-2.5 max-[1500px]:text-[0.82rem] max-[640px]:px-2.5 max-[640px]:py-2 max-[640px]:text-[0.82rem]"
                  >
                    Create user
                  </Link>
                </>
              )}

              <Link
                to="/private"
                className="flex items-center gap-[11px] rounded-full border border-[#26344d] bg-[rgba(2,6,23,0.72)] py-[7px] pe-[14px] ps-[7px] no-underline transition-colors hover:border-blue-500/60 max-[640px]:p-1"
              >
                <img
                  src={salehImage}
                  alt="Saleh Alkarabubi"
                  className="h-[46px] w-[46px] basis-[46px] shrink-0 rounded-full border-[3px] border-blue-500 bg-white object-cover object-[center_22%] max-[640px]:h-[38px] max-[640px]:w-[38px] max-[640px]:basis-[38px]"
                />

                <span className="flex min-w-[125px] flex-col justify-center max-[1500px]:hidden">
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
                className="cursor-pointer rounded-xl border border-slate-700 bg-transparent px-3.5 py-2.5 font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-white max-[640px]:whitespace-nowrap max-[640px]:px-2.5 max-[640px]:py-2 max-[640px]:text-[0.82rem] max-[420px]:px-2 max-[420px]:py-[7px] max-[420px]:text-[0.76rem]"
                onClick={logout}
              >
                {t.nav.signOut}
              </button>
            </>
          ) : !loading ? (
            <>
              <NavLink
                to="/login"
                className="px-3.5 py-[11px] font-semibold text-slate-300 no-underline transition-colors hover:text-white max-[640px]:whitespace-nowrap max-[640px]:px-2.5 max-[640px]:py-2 max-[640px]:text-[0.82rem] max-[420px]:px-2 max-[420px]:py-[7px] max-[420px]:text-[0.76rem]"
              >
                {t.nav.signIn}
              </NavLink>

            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
