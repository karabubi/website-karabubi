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
    <main className="auth-page">
      <section className="auth-card">

        <p className="eyebrow">
          {t.login.eyebrow}
        </p>

        <h1>{t.login.title}</h1>

        <p>
          {t.login.description}
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

          <div className="form-group">
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
            className="primary-button full-width"
            disabled={submitting}
          >
            {submitting
              ? t.login.submitting
              : t.login.submit}
          </button>
        </form>

        <p className="mt-6 text-center">
          {t.login.newHere}{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            {t.login.createAccount}
          </Link>
        </p>

      </section>
    </main>
  );
};

export default Login;
