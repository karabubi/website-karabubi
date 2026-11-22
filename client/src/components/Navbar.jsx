import React from "react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import salehImage from "../assets/saleh-nav.jpg";

function ChevronIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AdminIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Navbar() {
  const { user, loading, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navClass = ({ isActive }) => [
    "relative rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70",
    isActive
      ? "bg-white/[0.09] text-white shadow-sm ring-1 ring-white/10"
      : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100",
  ].join(" ");

  const adminLinks = [
    ["/admin/wisdom", t.nav.manageWisdom],
    ["/admin/wisdom-poetry", t.nav.managePoetry],
    ["/admin/literary-reflections", t.nav.manageReflections],
    ["/admin/videos", t.nav.manageVideos],
    ["/admin/gallery", t.nav.manageGallery],
    ["/register", "Create user"],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#050816]/90 text-slate-100 shadow-[0_12px_35px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1600px] flex-wrap items-center gap-3 px-4 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link to="/" className="group flex shrink-0 items-center gap-3 rounded-xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70" aria-label="Saleh Alkarabubi — Home">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-violet-600 text-sm font-black tracking-wide text-white shadow-lg shadow-blue-600/20 transition-transform duration-200 group-hover:-translate-y-0.5">SA</span>
          <span className="hidden xl:block">
            <strong className="block text-sm font-bold tracking-wide text-white">Saleh Alkarabubi</strong>
            <small className="block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Portfolio</small>
          </span>
        </Link>

        <nav className="order-3 flex basis-full items-center gap-1 overflow-x-auto border-t border-white/[0.06] py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:order-none lg:mx-auto lg:basis-auto lg:border-0 lg:py-0">
          <NavLink to="/" className={navClass}>{t.nav.home}</NavLink>
          <NavLink to="/about" className={navClass}>{t.nav.about}</NavLink>
          <NavLink to="/photos" className={navClass}>{t.nav.projects}</NavLink>
          <NavLink to="/contact" className={navClass}>{t.nav.contact}</NavLink>
          <NavLink to="/wisdom" className={navClass}>{t.nav.wisdom}</NavLink>
          <NavLink to="/wisdom-poetry" className={navClass}>{t.nav.poetry}</NavLink>
          <NavLink to="/literary-reflections" className={navClass}>{t.nav.reflections}</NavLink>
          <NavLink to="/videos" className={navClass}>{t.nav.videos}</NavLink>
          <NavLink to="/gallery" className={navClass}>{t.nav.gallery}</NavLink>
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          <label className="relative">
            <span className="sr-only">Select language</span>
            <select className="h-10 appearance-none rounded-xl border border-white/10 bg-white/[0.055] py-0 pe-8 ps-3 text-sm font-medium text-slate-200 outline-none transition hover:border-white/20 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/15 sm:min-w-[116px]" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Select language">
              <option value="en">🇬🇧 English</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="ar">🇸🇦 العربية</option>
            </select>
            <ChevronIcon className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </label>

          {!loading && user ? (
            <>
              {user.role === "admin" && (
                <details className="group relative">
                  <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 text-sm font-semibold text-violet-200 transition hover:border-violet-400/35 hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 [&::-webkit-details-marker]:hidden">
                    <AdminIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                    <ChevronIcon className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="absolute end-0 top-[calc(100%+12px)] z-[70] w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/98 p-2 shadow-2xl shadow-black/50 ring-1 ring-black/10 backdrop-blur-2xl">
                    <div className="border-b border-white/[0.07] px-3 py-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300">Administration</p>
                      <p className="mt-1 text-xs text-slate-500">Manage website content</p>
                    </div>
                    <div className="py-1.5">
                      {adminLinks.map(([to, label]) => (
                        <Link key={to} to={to} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 no-underline transition hover:bg-violet-500/10 hover:text-violet-200">
                          <span>{label}</span><span className="text-slate-600">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>
              )}

              <Link to="/private" className="rounded-full border border-white/10 bg-white/[0.045] p-1 no-underline transition hover:border-blue-400/40 hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60" title={user.name || t.nav.dashboard}>
                <img src={salehImage} alt="Saleh Alkarabubi" className="h-9 w-9 rounded-full border-2 border-blue-500 bg-white object-cover object-[center_22%]" />
              </Link>
              <button type="button" className="hidden h-10 cursor-pointer rounded-xl border border-white/10 bg-white/[0.035] px-3 text-sm font-semibold text-slate-400 transition hover:border-white/20 hover:text-white sm:block" onClick={logout}>{t.nav.signOut}</button>
            </>
          ) : !loading ? (
            <NavLink to="/login" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white no-underline shadow-lg shadow-blue-900/20 transition hover:bg-blue-500">{t.nav.signIn}</NavLink>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
