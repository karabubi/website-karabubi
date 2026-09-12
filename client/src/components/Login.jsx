import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const {
    login,
  } = useAuth();

  const [
    identifier,
    setIdentifier,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSubmitting(true);

      try {
        await login({
          identifier,
          password,
        });

        navigate("/private");
      } catch (err) {
        setError(
          err.message ||
          t.login.errorFallback
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-7 shadow-2xl backdrop-blur-xl sm:p-9 [&>h1]:text-3xl [&>h1]:font-black [&>h1]:tracking-tight [&>h1]:text-white [&>p]:mt-2 [&>p]:text-sm [&>p]:leading-6 [&>p]:text-slate-400">

        <p className="mb-6 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
          {t.login.eyebrow}
        </p>

        <h1>{t.login.title}</h1>

        <p>
          {t.login.description}
        </p>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2 [&>label]:text-sm [&>label]:font-semibold [&>label]:text-slate-300 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-white/10 [&>input]:bg-slate-900 [&>input]:px-4 [&>input]:py-3.5 [&>input]:text-white [&>input]:outline-none [&>input]:transition [&>input]:placeholder:text-slate-600 [&>input]:focus:border-blue-500 [&>input]:focus:ring-4 [&>input]:focus:ring-blue-500/10">
            <label htmlFor="identifier">
              {t.login.identifierLabel}
            </label>

            <input
              id="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(event) =>
                setIdentifier(
                  event.target.value
                )
              }
              placeholder={t.login.identifierPlaceholder}
              required
            />
          </div>

          <div className="space-y-2 [&>label]:text-sm [&>label]:font-semibold [&>label]:text-slate-300 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-white/10 [&>input]:bg-slate-900 [&>input]:px-4 [&>input]:py-3.5 [&>input]:text-white [&>input]:outline-none [&>input]:transition [&>input]:placeholder:text-slate-600 [&>input]:focus:border-blue-500 [&>input]:focus:ring-4 [&>input]:focus:ring-blue-500/10">
            <label htmlFor="password">
              {t.login.passwordLabel}
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder={t.login.passwordPlaceholder}
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500"
            disabled={submitting}
          >
            {submitting
              ? t.login.submitting
              : t.login.submit}
          </button>
        </form>


      </section>
    </main>
  );
};

export default Login;
