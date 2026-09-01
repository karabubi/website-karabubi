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

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
  } = useAuth();

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
          "Password must contain at least 8 characters."
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
          "Unable to create account."
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <main className="auth-page">
      <section className="auth-card">

        <p className="eyebrow">
          Join the website
        </p>

        <h1>
          Create account
        </h1>

        <p>
          Create your account to access
          the private area.
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
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">
              Username
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
              Email
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
              Password
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
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            Sign in
          </Link>
        </p>

      </section>
    </main>
  );
};

export default Register;
