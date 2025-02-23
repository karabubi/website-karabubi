import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login } from "../api";

const Register = ({ setIsAuthenticated }) => {
  const [isRegistering, setIsRegistering] = useState(true);
  const [formData, setFormData] = useState({ name: "", username: "", password: "", email: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = isRegistering ? await register(formData) : await login(formData);
      if (response.data.success) {
        setIsAuthenticated(true);
        navigate("/private");
      } else {
        setError(response.data.error || "An error occurred.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-500 mb-6 text-center">
          {isRegistering ? "Register" : "Login"}
        </h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <input
              type="text"
              placeholder="Name"
              className="input"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          )}
          <input type="text" placeholder="Username" className="input" />
          {isRegistering && <input type="email" placeholder="Email" className="input" />}
          <input type="password" placeholder="Password" className="input" />
          <button className="btn">{isRegistering ? "Register" : "Login"}</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
