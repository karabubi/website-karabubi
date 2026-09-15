import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

function SparkleIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 2.75c.42 4.31 2.94 6.83 7.25 7.25-4.31.42-6.83 2.94-7.25 7.25-.42-4.31-2.94-6.83-7.25-7.25C9.06 9.58 11.58 7.06 12 2.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M19 16.75c.16 1.63 1.12 2.59 2.75 2.75-1.63.16-2.59 1.12-2.75 2.75-.16-1.63-1.12-2.59-2.75-2.75 1.63-.16 2.59-1.12 2.75-2.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RefreshIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Wisdom() {
  const { t } = useLanguage();

  const [wisdom, setWisdom] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const loadWisdom = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/wisdom/random`
        );

        const data = await response.json();

        if (response.status === 404) {
          setWisdom(null);
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              t.wisdom.loadError
          );
        }

        setWisdom(data.quote);
      } catch (requestError) {
        setWisdom(null);
        setError(
          requestError.message ||
            t.wisdom.loadError
        );
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    loadWisdom();
  }, [loadWisdom]);

  return (
    <main className="relative min-h-[calc(100vh-86px)] overflow-hidden bg-[#050816] text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[110px]" />
        <div className="absolute -right-32 top-20 h-[460px] w-[460px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-[-220px] left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "54px 54px",
          }}
        />

        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-blue-500/5 to-transparent" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-86px)] w-full max-w-7xl items-center justify-center px-6 py-16 sm:px-8 lg:px-10">
        <div className="w-full max-w-5xl">
          <header className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-4 py-2 shadow-lg shadow-blue-950/20 backdrop-blur-xl">
              <SparkleIcon className="h-4 w-4 text-blue-300" />

              <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200 sm:text-sm">
                {t.wisdom.eyebrow}
              </span>
            </div>

            <h1 className="bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-4xl font-black tracking-[-0.04em] text-transparent sm:text-5xl lg:text-6xl">
              {t.wisdom.title}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              {t.wisdom.description}
            </p>
          </header>

          <div className="relative mx-auto mt-12 max-w-4xl sm:mt-14">
            <div
              aria-hidden="true"
              className="absolute -inset-px rounded-[32px] bg-gradient-to-r from-blue-500/40 via-violet-500/20 to-cyan-400/30 blur-[1px]"
            />

            <article className="relative overflow-hidden rounded-[31px] border border-white/[0.08] bg-slate-950/75 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent"
              />

              <div
                aria-hidden="true"
                className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-500/[0.07] blur-3xl"
              />

              <div className="relative px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
                {loading ? (
                  <div
                    className="flex min-h-[260px] flex-col items-center justify-center"
                    aria-live="polite"
                  >
                    <div className="relative mb-7">
                      <div className="h-14 w-14 rounded-full border-2 border-blue-400/15" />
                      <div className="absolute inset-0 h-14 w-14 animate-spin rounded-full border-2 border-transparent border-t-blue-400" />
                      <SparkleIcon className="absolute inset-0 m-auto h-5 w-5 text-blue-300" />
                    </div>

                    <p className="text-sm font-medium tracking-wide text-slate-400">
                      {t.wisdom.loading}
                    </p>
                  </div>
                ) : error ? (
                  <div
                    className="flex min-h-[260px] flex-col items-center justify-center text-center"
                    aria-live="polite"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 text-red-300">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-6 w-6"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 8v5m0 3.5v.01M10.3 3.7 2.8 17a2 2 0 0 0 1.74 3h14.92a2 2 0 0 0 1.74-3L13.7 3.7a1.96 1.96 0 0 0-3.4 0Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <p className="max-w-xl text-base leading-7 text-red-200">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={loadWisdom}
                      className="group mt-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-blue-500/15 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:ring-offset-2 focus:ring-offset-slate-950"
                    >
                      <RefreshIcon className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                      {t.wisdom.tryAgain}
                    </button>
                  </div>
                ) : wisdom ? (
                  <div
                    className="flex min-h-[330px] flex-col items-center justify-center text-center"
                    aria-live="polite"
                  >
                    <div
                      aria-hidden="true"
                      className="mb-3 select-none font-serif text-[84px] font-black leading-[0.7] text-blue-400/70 sm:text-[100px]"
                    >
                      “
                    </div>

                    <blockquote
                      dir="auto"
                      className="mx-auto max-w-3xl text-balance text-2xl font-medium leading-[1.65] tracking-[-0.015em] text-slate-50 sm:text-3xl sm:leading-[1.6] lg:text-[2rem]"
                    >
                      {wisdom.quote}
                    </blockquote>

                    <div
                      aria-hidden="true"
                      className="my-8 flex items-center gap-3"
                    >
                      <span className="h-px w-10 bg-gradient-to-r from-transparent to-blue-400/50" />
                      <span className="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-blue-300/70" />
                      <span className="h-px w-10 bg-gradient-to-l from-transparent to-blue-400/50" />
                    </div>

                    <button
                      type="button"
                      onClick={loadWisdom}
                      disabled={loading}
                      className="group relative inline-flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(37,99,235,0.38)] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                      />

                      <RefreshIcon className="relative h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />

                      <span className="relative">
                        {t.wisdom.showAnother}
                      </span>

                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                        className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      >
                        <path
                          d="M4 10h12m-4-4 4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex min-h-[260px] flex-col items-center justify-center text-center"
                    aria-live="polite"
                  >
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">
                      <SparkleIcon className="h-7 w-7 text-blue-300" />
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-white">
                      {t.wisdom.emptyTitle}
                    </h2>

                    <p className="mt-3 max-w-lg leading-7 text-slate-400">
                      {t.wisdom.emptyText}
                    </p>
                  </div>
                )}
              </div>
            </article>

            <div
              aria-hidden="true"
              className="mx-auto mt-6 flex items-center justify-center gap-2 text-blue-300/30"
            >
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
              <span className="h-1 w-1 rounded-full bg-current" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Wisdom;
