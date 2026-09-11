import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useLanguage,
} from "../context/LanguageContext";

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
  } = useAuth();

  const {
    t,
  } = useLanguage();

  const [
    form,
    setForm,
  ] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [
    error,
    setError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const updateField =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setForm((current) => ({
        ...current,
        [name]: value,
      }));
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      if (
        form.password.length < 8
      ) {
        setError(
          t.register.passwordTooShort
        );

        return;
      }

      setSubmitting(true);

      try {
        await register(form);

        navigate("/private");
      } catch (err) {
        setError(
          err.message ||
          t.register.errorFallback
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-7 shadow-2xl backdrop-blur-xl sm:p-9 [&>h1]:text-3xl [&>h1]:font-black [&>h1]:tracking-tight [&>h1]:text-white [&>p]:mt-2 [&>p]:text-sm [&>p]:leading-6 [&>p]:text-slate-400">

        <p className="mb-6 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
          {t.register.eyebrow}
        </p>

        <h1>
          {t.register.title}
        </h1>

        <p>
          {t.register.description}
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
            <label htmlFor="name">
              {t.register.fullName}
            </label>

            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={updateField}
              required
            />
          </div>

          <div className="space-y-2 [&>label]:text-sm [&>label]:font-semibold [&>label]:text-slate-300 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-white/10 [&>input]:bg-slate-900 [&>input]:px-4 [&>input]:py-3.5 [&>input]:text-white [&>input]:outline-none [&>input]:transition [&>input]:placeholder:text-slate-600 [&>input]:focus:border-blue-500 [&>input]:focus:ring-4 [&>input]:focus:ring-blue-500/10">
            <label htmlFor="username">
              {t.register.username}
            </label>

            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={updateField}
              required
            />
          </div>

          <div className="space-y-2 [&>label]:text-sm [&>label]:font-semibold [&>label]:text-slate-300 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-white/10 [&>input]:bg-slate-900 [&>input]:px-4 [&>input]:py-3.5 [&>input]:text-white [&>input]:outline-none [&>input]:transition [&>input]:placeholder:text-slate-600 [&>input]:focus:border-blue-500 [&>input]:focus:ring-4 [&>input]:focus:ring-blue-500/10">
            <label htmlFor="email">
              {t.register.email}
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </div>

          <div className="space-y-2 [&>label]:text-sm [&>label]:font-semibold [&>label]:text-slate-300 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-white/10 [&>input]:bg-slate-900 [&>input]:px-4 [&>input]:py-3.5 [&>input]:text-white [&>input]:outline-none [&>input]:transition [&>input]:placeholder:text-slate-600 [&>input]:focus:border-blue-500 [&>input]:focus:ring-4 [&>input]:focus:ring-blue-500/10">
            <label htmlFor="password">
              {t.register.password}
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength="8"
              value={form.password}
              onChange={updateField}
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500"
            disabled={submitting}
          >
            {submitting
              ? t.register.submitting
              : t.register.submit}
          </button>
        </form>

        <p className="mt-6 text-center">
          {t.register.alreadyAccount}{" "}

          <Link
            to="/login"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            {t.register.signIn}
          </Link>
        </p>

      </section>
    </main>
  );
};

export default Register;
