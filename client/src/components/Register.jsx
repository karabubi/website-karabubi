import {
  useState,
} from "react";
import {
  Link,
  Navigate,
} from "react-router-dom";
import {
  useAuth,
} from "../context/AuthContext";

const Register = () => {
  const {
    user,
    loading,
    isAuthenticated,
    createUser,
  } = useAuth();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16 text-slate-300">
        Loading...
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user?.role !== "admin") {
    return (
      <Navigate
        to="/private"
        replace
      />
    );
  }

  const updateField = (event) => {
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
      setSuccess("");

      if (form.password.length < 8) {
        setError(
          "Password must contain at least 8 characters."
        );
        return;
      }

      setSubmitting(true);

      try {
        const response =
          await createUser(form);

        const createdUser =
          response.user;

        setSuccess(
          createdUser?.username
            ? `User "${createdUser.username}" was created successfully.`
            : "User was created successfully."
        );

        setForm({
          name: "",
          username: "",
          email: "",
          password: "",
        });
      } catch (err) {
        setError(
          err.message ||
          "Unable to create user."
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        <p className="mb-6 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
          Administrator
        </p>

        <h1 className="text-3xl font-black tracking-tight text-white">
          Create user
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Create a new account. The new account will have normal user access.
        </p>

        {success && (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-slate-300"
            >
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              autoComplete="off"
              value={form.name}
              onChange={updateField}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-semibold text-slate-300"
            >
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              autoComplete="off"
              value={form.username}
              onChange={updateField}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-300"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={updateField}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-300"
            >
              Temporary password
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
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Creating user..."
              : "Create user"}
          </button>
        </form>

        <Link
          to="/private"
          className="mt-6 inline-flex font-semibold text-blue-400 hover:text-blue-300"
        >
          Back to private area
        </Link>
      </section>
    </main>
  );
};

export default Register;
