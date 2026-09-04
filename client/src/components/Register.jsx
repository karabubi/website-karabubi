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
    <main className="auth-page">
      <section className="auth-card">

        <p className="eyebrow">
          {t.register.eyebrow}
        </p>

        <h1>
          {t.register.title}
        </h1>

        <p>
          {t.register.description}
        </p>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
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
            className="primary-button full-width"
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
