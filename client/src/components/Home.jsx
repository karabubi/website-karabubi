import { useEffect, useState } from "react";
import React from "react";
import { Link } from "react-router-dom";
import { getVisitorStats, recordSiteVisit } from "../api";
import { useLanguage } from "../context/LanguageContext";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-5-5 5 5-5 5"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 text-blue-400"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 9-3 3 3 3m8-6 3 3-3 3m-2-9-4 12"
      />
    </svg>
  );
}

function getFocusItems(t) {
  return [
    {
      number: "01",
      label: t.home.frontend,
      value: "React / TypeScript",
    },
    {
      number: "02",
      label: t.home.backend,
      value: "Node.js / Express",
    },
    {
      number: "03",
      label: t.home.database,
      value: "PostgreSQL",
    },
    {
      number: "04",
      label: t.home.focus,
      value: t.home.fullStackDevelopment,
    },
  ];
}

function Home() {

  const [visitorStats, setVisitorStats] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    const loadVisitorCounter = async () => {
      try {
        const storageKey = "websiteKarabubiVisitorId";

        let visitorId =
          localStorage.getItem(storageKey);

        if (!visitorId) {
          visitorId =
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2)}-${Math.random()
                  .toString(36)
                  .slice(2)}`;

          localStorage.setItem(
            storageKey,
            visitorId
          );
        }

        await recordSiteVisit({
          visitorId,
          path: window.location.pathname,
        });

        const stats = await getVisitorStats();

        if (active) {
          setVisitorStats(stats);
        }
      } catch (error) {
        console.error(
          "Visitor counter error:",
          error
        );
      }
    };

    loadVisitorCounter();

    return () => {
      active = false;
    };
  }, []);


  const { t, language } = useLanguage();
  const homeLocale =
    language === "de"
      ? "de-DE"
      : language === "ar"
        ? "ar"
        : "en-US";

  const focusItems = getFocusItems(t);

  return (
    <main className="relative min-h-[calc(100vh-88px)] overflow-hidden bg-slate-950 px-4 py-6 text-slate-100 sm:px-[22px] sm:py-[30px] lg:px-[clamp(28px,4vw,64px)] lg:pb-[58px] lg:pt-12">
      <section className="relative z-10 mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-[55px] lg:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.8fr)] lg:gap-[clamp(42px,5vw,68px)]">
        <div className="self-center lg:max-w-[900px]">
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-blue-400/20 bg-slate-900/70 px-4 py-2.5 text-[0.73rem] font-extrabold uppercase tracking-[0.16em] text-blue-200 shadow-lg shadow-black/20">
            <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-blue-400 shadow-[0_0_16px_rgba(77,163,255,0.95)]" />
            {t.home.available}
          </div>

          <div className="mt-0 lg:mt-[21px]">
            <span className="mb-3 block text-sm font-bold uppercase tracking-[0.16em] text-blue-300/80">
              {t.home.name}
            </span>

            <h1 className="m-0 text-[clamp(3rem,15vw,4.2rem)] font-[760] leading-[0.92] tracking-[-0.055em] text-slate-50 sm:text-[clamp(3.4rem,6vw,5.3rem)] lg:text-[clamp(3.35rem,5.65vw,5.75rem)]">
              {t.home.titleMain}
              <span className="mt-2 block bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {t.home.titleHighlight}
              </span>
            </h1>
          </div>

          <p className="mt-[22px] max-w-[900px] text-[0.98rem] font-normal leading-[1.72] text-slate-300/75 sm:text-base lg:text-[clamp(1rem,1.2vw,1.22rem)]">
            {t.home.description}
          </p>

          <div className="mt-[27px] grid grid-cols-1 gap-3.5 sm:flex sm:flex-wrap">
            <Link
              to="/photos"
              className="group inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[14px] border border-blue-400/40 bg-gradient-to-br from-blue-500 to-blue-700 px-7 text-[0.98rem] font-bold text-white shadow-[0_15px_35px_rgba(37,99,235,0.26)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(37,99,235,0.36)] sm:w-auto"
            >
              {t.home.viewProjects}
              <ArrowIcon />
            </Link>

            <Link
              to="/about"
              className="inline-flex min-h-[58px] w-full items-center justify-center rounded-[14px] border border-slate-400/25 bg-slate-900/50 px-7 text-[0.98rem] font-bold text-slate-200 transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-slate-800/70 sm:w-auto"
            >
              {t.home.aboutMe}
            </Link>

            <Link
              to="/contact"
              className="inline-flex min-h-[58px] w-full items-center justify-center rounded-[14px] border border-slate-400/25 bg-slate-900/50 px-7 text-[0.98rem] font-bold text-slate-200 transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-slate-800/70 sm:w-auto"
            >
              {t.home.contactMe}
            </Link>
          </div>

          <div className="mt-[34px]">
            <span className="mb-4 block text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-blue-200/70">
              {t.home.coreTechnologies}
            </span>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-[11px] [&>i]:hidden [&>span]:inline-flex [&>span]:min-h-11 [&>span]:items-center [&>span]:justify-center [&>span]:rounded-xl [&>span]:border [&>span]:border-slate-400/20 [&>span]:bg-slate-900/70 [&>span]:px-4 [&>span]:text-[0.86rem] [&>span]:font-semibold [&>span]:text-slate-200/90 [&>span]:transition [&>span]:duration-200 hover:[&>span]:-translate-y-0.5 hover:[&>span]:border-blue-500/45">
              <span>React</span>
              <i />
              <span>TypeScript</span>
              <i />
              <span>Node.js</span>
              <i />
              <span>Express</span>
              <i />
              <span>PostgreSQL</span>
            </div>
          </div>

          <div className="mt-[19px] inline-flex items-center gap-2 text-sm text-slate-400/80">
            <span className="text-blue-400">
              ◎
            </span>
            {t.home.location}
          </div>
        </div>

        <aside className="relative w-full self-center overflow-hidden rounded-[20px] border border-blue-400/20 bg-slate-950/80 p-[17px] shadow-[0_26px_70px_rgba(0,0,0,0.28)] sm:max-w-[620px] sm:rounded-3xl sm:p-[22px] lg:max-w-none lg:p-6">
          <div className="relative z-10 mb-[18px] flex items-center justify-between gap-3 border-b border-slate-400/10 pb-[17px]">
            <div className="flex min-w-0 items-center gap-3 [&>div]:min-w-0 [&>div]:leading-tight [&>div>span]:block [&>div>span]:text-[0.7rem] [&>div>span]:font-semibold [&>div>span]:uppercase [&>div>span]:tracking-[0.12em] [&>div>span]:text-slate-400 [&>div>strong]:mt-1 [&>div>strong]:block [&>div>strong]:text-sm [&>div>strong]:font-bold [&>div>strong]:text-slate-100">
              <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-blue-400/10 bg-blue-900/20">
                <CodeIcon />
              </span>

              <div>
                <span>{t.home.developerProfile}</span>
                <strong>{t.home.technicalFocus}</strong>
              </div>
            </div>

            <span className="shrink-0 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-emerald-300">
              {t.home.active}
            </span>
          </div>

          <div className="hidden" />

          <div className="relative z-10 grid overflow-hidden rounded-2xl border border-slate-400/10 bg-slate-950/40">
            {focusItems.map((item) => (
              <div
                className="grid min-h-[76px] grid-cols-[52px_minmax(0,1fr)] items-center gap-4 border-b border-slate-400/10 px-4 py-[15px] last:border-b-0 sm:min-h-[84px]"
                key={item.number}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-blue-400/10 bg-blue-900/25 text-[0.77rem] font-extrabold text-blue-100">
                  {item.number}
                </span>

                <div className="min-w-0 [&>small]:mb-1.5 [&>small]:block [&>small]:text-[0.72rem] [&>small]:font-bold [&>small]:uppercase [&>small]:tracking-[0.09em] [&>small]:text-slate-400/75 [&>strong]:block [&>strong]:text-[0.96rem] [&>strong]:font-semibold [&>strong]:text-slate-200">
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3.5">
            {visitorStats && (
              <div
                className="relative grid w-full min-w-0 grid-cols-1 gap-[13px] overflow-hidden rounded-2xl border border-blue-400/50 bg-blue-950/60 p-4 shadow-[0_12px_34px_rgba(0,0,0,0.2)] sm:px-[18px] sm:py-[17px]"
                aria-label={t.home.analyticsAria}
              >
                <div className="flex items-center gap-2 pr-14 text-[0.68rem] font-extrabold uppercase tracking-[0.11em] text-blue-200/75 [&>span:first-child]:text-emerald-400">
                  <span aria-hidden="true">●</span>
                  <span>{t.home.visitorAnalytics}</span>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="relative pl-[38px] text-[0.82rem] font-semibold text-slate-300/75 before:absolute before:left-0 before:top-1/2 before:grid before:h-[30px] before:w-[30px] before:-translate-y-1/2 before:place-items-center before:rounded-[10px] before:bg-blue-600/20 before:content-['👥']">
                    {t.home.visitors}
                  </span>

                  <strong>
                    {Number(
                      visitorStats.uniqueVisitors || 0
                    ).toLocaleString(homeLocale)}
                  </strong>
                </div>

                <time
                  className="block pl-[38px] text-[0.73rem] font-medium leading-[1.45] tracking-[0.018em] text-slate-300/70"
                  dateTime={currentDateTime.toISOString()}
                >
                  {new Intl.DateTimeFormat(homeLocale, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(currentDateTime)}
                  {" · "}
                  {new Intl.DateTimeFormat(homeLocale, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  }).format(currentDateTime)}
                </time>
              </div>
            )}

            <span className="block w-full px-0.5 pt-1 text-left text-[0.66rem] font-medium leading-[1.4] tracking-[0.025em] text-slate-400/70 rtl:text-right">
              {t.home.modernApplications}
              <span className="text-blue-400/50">
                {" · "}
              </span>
              <span className="text-slate-400/75">
                {t.home.buildLearnCreate}
              </span>
            </span>

            <span className="inline-grid h-9 w-9 place-items-center rounded-[10px] border border-blue-400/20 bg-blue-900/25 text-[0.71rem] font-extrabold text-blue-100">
              SA
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Home;
