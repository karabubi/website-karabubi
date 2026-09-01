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

const Login = () => {
  const navigate = useNavigate();

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
          "Unable to sign in."
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <main className="auth-page">
      <section className="auth-card">

        <p className="eyebrow">
          Welcome back
        </p>

        <h1>
          Sign in
        </h1>

        <p>
          Enter your username or email
          and password.
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
              Username or email
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
              placeholder="Username or email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
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
              placeholder="Your password"
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button full-width"
            disabled={submitting}
          >
            {submitting
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center">
          New here?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            Create an account
          </Link>
        </p>

      </section>
    </main>
  );
};

export default Login;
