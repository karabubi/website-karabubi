import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

function SparkleIcon({
  className = "",
}) {
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

function RefreshIcon({
  className = "",
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M20 11a8 8 0 0 0-15.5-2M4 5v4h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13a8 8 0 0 0 15.5 2M20 19v-4h-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WisdomPoetry() {
  const { t } = useLanguage();

  const [poem, setPoem] =
    useState(null);

  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(100);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadPoem = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/wisdom-poetry/random`
        );

        const data =
          await response.json();

        if (response.status === 404) {
          setPoem(null);
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              t.poetry.loadError
          );
        }

        setPoem(data.poem);
      } catch (requestError) {
        setPoem(null);

        setError(
          requestError.message ||
            t.poetry.loadError
        );
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    loadPoem();
  }, [loadPoem]);

  return (
    <main className="relative isolate min-h-[calc(100vh-86px)] overflow-hidden bg-[#060914] text-slate-100 selection:bg-violet-500/30">

      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-[-160px] top-[-160px] h-[520px] w-[520px] rounded-full bg-violet-600/15 blur-[130px]" />

        <div className="absolute right-[-180px] top-[100px] h-[520px] w-[520px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute bottom-[-260px] left-1/2 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-fuchsia-600/[0.08] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize:
              "56px 56px",
          }}
        />

        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-500/[0.05] to-transparent" />
      </div>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">

        {/* Header */}
        <header className="mx-auto max-w-3xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/[0.07] px-4 py-2 shadow-lg shadow-violet-950/20 backdrop-blur-xl">

            <SparkleIcon className="h-4 w-4 text-violet-300" />

            <span className="text-xs font-bold uppercase tracking-[0.24em] text-violet-200 sm:text-sm">
              {t.poetry.eyebrow}
            </span>

          </div>

          <h1 className="mt-7 bg-gradient-to-r from-white via-violet-100 to-blue-200 bg-clip-text text-4xl font-black tracking-[-0.045em] text-transparent sm:text-5xl lg:text-6xl">
            {t.poetry.title}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            {t.poetry.description}
          </p>

        </header>

        {/* Main poetry card */}
        <div className="relative mx-auto mt-10 max-w-4xl sm:mt-12">

          <div
            aria-hidden="true"
            className="absolute -inset-px rounded-[34px] bg-gradient-to-br from-violet-400/40 via-white/[0.05] to-blue-500/30 blur-[1px]"
          />

          <article className="relative overflow-hidden rounded-[33px] border border-white/[0.07] bg-[#0a0e1c]/90 shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">

            {/* Top glow */}
            <div
              aria-hidden="true"
              className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/80 to-transparent"
            />

            <div
              aria-hidden="true"
              className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-violet-500/[0.07] blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute bottom-[-100px] left-[-70px] h-64 w-64 rounded-full bg-blue-500/[0.06] blur-3xl"
            />

            <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">

              {loading ? (
                <div
                  className="flex min-h-[340px] flex-col items-center justify-center"
                  aria-live="polite"
                >
                  <div className="relative">

                    <div className="h-16 w-16 rounded-full border border-violet-300/10 bg-white/[0.02]" />

                    <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-violet-400" />

                    <SparkleIcon className="absolute inset-0 m-auto h-5 w-5 text-violet-300" />

                  </div>

                  <p className="mt-6 text-sm font-medium tracking-wide text-slate-500">
                    {t.poetry.loading}
                  </p>
                </div>
              ) : error ? (
                <div
                  className="flex min-h-[340px] flex-col items-center justify-center text-center"
                  aria-live="polite"
                >

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.08]">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-7 w-7 text-red-300"
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

                  <h2 className="mt-6 text-xl font-bold text-white">
                    {t.poetry.loadErrorTitle}
                  </h2>

                  <p className="mt-3 max-w-md leading-7 text-slate-400">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadPoem}
                    className="group mt-8 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-violet-500/10"
                  >
                    <RefreshIcon className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                    {t.poetry.tryAgain}
                  </button>

                </div>
              ) : poem ? (
                <div
                  className="mx-auto flex min-h-[340px] max-w-4xl flex-col items-center justify-center text-center"
                  aria-live="polite"
                >

                  {poem.imageUrl && (
                    <>
                      <div className="mb-8 w-full overflow-hidden rounded-[26px] border border-white/[0.08] bg-slate-950/70 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                        <button
                          type="button"
                          onClick={() => {
                          setImageZoom(100);
                          setIsImageOpen(true);
                        }}
                          className="block w-full cursor-zoom-in rounded-[20px] focus:outline-none focus:ring-2 focus:ring-violet-400/70"
                          aria-label="Enlarge poetry image"
                          title="Click to enlarge"
                        >
                          <img
                            src={`${API_URL}${poem.imageUrl}`}
                            alt={
                              poem.title ||
                              poem.author ||
                              "Wisdom poetry"
                            }
                            className="mx-auto max-h-[460px] w-full rounded-[20px] object-contain transition-transform duration-200 hover:scale-[1.01]"
                          />
                        </button>
                      </div>

                      {isImageOpen && (
                        <div
                          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-auto bg-black/90 p-4 backdrop-blur-sm"
                          role="dialog"
                          aria-modal="true"
                          aria-label="Enlarged poetry image"
                          onClick={() => {
                            setIsImageOpen(false);
                            setImageZoom(100);
                          }}
                        >
                          <div
                            className="fixed bottom-5 left-1/2 z-[10000] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/80 px-3 py-2 text-white shadow-2xl backdrop-blur-md"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setImageZoom((zoom) =>
                                  Math.max(100, zoom - 10)
                                )
                              }
                              disabled={imageZoom <= 100}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Zoom out"
                              title="Zoom out"
                            >
                              −
                            </button>

                            <input
                              type="range"
                              min="100"
                              max="200"
                              step="10"
                              value={imageZoom}
                              onChange={(event) =>
                                setImageZoom(
                                  Number(event.target.value)
                                )
                              }
                              className="w-20 cursor-pointer sm:w-36"
                              aria-label="Image zoom"
                              title="Image zoom"
                            />

                            <span
                              className="min-w-[52px] text-center text-sm font-semibold tabular-nums"
                              aria-live="polite"
                            >
                              {imageZoom}%
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setImageZoom((zoom) =>
                                  Math.min(200, zoom + 10)
                                )
                              }
                              disabled={imageZoom >= 200}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Zoom in"
                              title="Zoom in"
                            >
                              +
                            </button>

                            <button
                              type="button"
                              onClick={() => setImageZoom(100)}
                              disabled={imageZoom === 100}
                              className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Reset zoom"
                              title="Reset zoom"
                            >
                              Reset
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                            setIsImageOpen(false);
                            setImageZoom(100);
                          }}
                            className="fixed right-4 top-4 z-[10000] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/70 text-3xl text-white shadow-xl transition hover:bg-white hover:text-black"
                            aria-label="Close enlarged image"
                            title="Close image"
                          >
                            ×
                          </button>

                          <img
                            src={`${API_URL}${poem.imageUrl}`}
                            alt={
                              poem.title ||
                              poem.author ||
                              "Wisdom poetry"
                            }
                            className="max-h-[92vh] max-w-[96vw] rounded-xl object-contain shadow-2xl transition-transform duration-200 ease-out"
                            style={{ transform: `scale(${imageZoom / 100})`, transformOrigin: "center center" }}
                            onClick={(event) => event.stopPropagation()}
                          />
                        </div>
                      )}
                    </>
                  )}

{/* Decorative mark */}
                  <div
                    aria-hidden="true"
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/10 bg-gradient-to-br from-violet-400/10 to-blue-400/[0.04] shadow-lg shadow-violet-950/20"
                  >
                    <span className="font-serif text-3xl text-violet-300">
                      ❦
                    </span>
                  </div>

                  {poem.title && (
                    <h2
                      dir="auto"
                      className="mt-5 max-w-3xl text-balance font-serif text-3xl font-semibold tracking-[-0.025em] text-white sm:text-4xl lg:text-[2.65rem]"
                    >
                      {poem.title}
                    </h2>
                  )}

                  <div
                    aria-hidden="true"
                    className="my-6 flex items-center gap-3"
                  >
                    <span className="h-px w-12 bg-gradient-to-r from-transparent to-violet-400/50" />

                    <span className="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-violet-300/70" />

                    <span className="h-px w-12 bg-gradient-to-l from-transparent to-violet-400/50" />
                  </div>

                  <blockquote
                    dir="auto"
                    className="mx-auto max-w-2xl whitespace-pre-line text-pretty font-serif text-xl font-normal leading-[1.8] text-slate-100 sm:text-[1.4rem] sm:leading-[1.9] lg:text-[1.55rem] lg:leading-[1.95]"
                  >
                    {poem.poem}
                  </blockquote>

                  {poem.author && (
                    <div className="mt-7">

                      <div className="mx-auto mb-4 h-px w-8 bg-violet-400/40" />

                      <p
                        dir="auto"
                        className="text-sm font-bold uppercase tracking-[0.18em] text-violet-300"
                      >
                        {poem.author}
                      </p>

                    </div>
                  )}

                  <button
                    type="button"
                    onClick={loadPoem}
                    disabled={loading}
                    className="group relative mt-9 inline-flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-violet-600 to-blue-600 px-7 py-3.5 font-semibold text-white shadow-[0_16px_45px_rgba(124,58,237,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(124,58,237,0.38)] focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-[#0a0e1c] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                    />

                    <RefreshIcon className="relative h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />

                    <span className="relative">
                      {t.poetry.showAnother}
                    </span>
                  </button>

                  <p className="mt-5 text-xs tracking-wide text-slate-600">
                    {t.poetry.randomHint}
                  </p>

                </div>
              ) : (
                <div className="flex min-h-[340px] flex-col items-center justify-center text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-300/10 bg-violet-400/[0.05]">
                    <SparkleIcon className="h-7 w-7 text-violet-300" />
                  </div>

                  <h2 className="mt-6 text-2xl font-bold text-white">
                    {t.poetry.emptyTitle}
                  </h2>

                  <p className="mt-3 max-w-md leading-7 text-slate-400">
                    {t.poetry.emptyText}
                  </p>

                </div>
              )}

            </div>
          </article>

          {/* Bottom detail */}
          <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
            <span className="h-px w-8 bg-slate-800" />
            {t.poetry.footer}
            <span className="h-px w-8 bg-slate-800" />
          </div>

        </div>
      </section>
    </main>
  );
}

export default WisdomPoetry;
