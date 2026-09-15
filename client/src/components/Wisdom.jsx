import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

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
    <main className="min-h-[calc(100vh-86px)] bg-slate-950 px-6 py-16 text-slate-100 max-[640px]:px-4 max-[640px]:py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <span className="mb-4 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">
          {t.wisdom.eyebrow}
        </span>

        <h1 className="text-4xl font-bold tracking-tight text-white max-[640px]:text-3xl">
          {t.wisdom.title}
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
          {t.wisdom.description}
        </p>

        <div className="mt-10 w-full rounded-3xl border border-slate-800 bg-slate-900/70 p-10 shadow-2xl shadow-black/20 max-[640px]:p-6">
          {loading ? (
            <p className="text-lg text-slate-400">
              {t.wisdom.loading}
            </p>
          ) : error ? (
            <div>
              <p className="text-red-300">
                {error}
              </p>

              <button
                type="button"
                onClick={loadWisdom}
                className="mt-6 cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
              >
                {t.wisdom.tryAgain}
              </button>
            </div>
          ) : wisdom ? (
            <>
              <div
                className="text-6xl leading-none text-blue-400"
                aria-hidden="true"
              >
                “
              </div>

              <blockquote className="mx-auto mt-3 max-w-3xl text-2xl font-medium leading-10 text-slate-100 max-[640px]:text-xl max-[640px]:leading-8">
                {wisdom.quote}
              </blockquote>

              <button
                type="button"
                onClick={loadWisdom}
                className="mt-9 cursor-pointer rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                {t.wisdom.showAnother}
              </button>
            </>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {t.wisdom.emptyTitle}
              </h2>

              <p className="mt-3 text-slate-400">
                {t.wisdom.emptyText}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Wisdom;
