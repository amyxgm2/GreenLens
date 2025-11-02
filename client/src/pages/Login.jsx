import { useState } from "react";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required.";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const res = await fetch("https://greenlens-50r4.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid username or password.");
      }

      setMessage("Login successful!");
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <img
          className="mb-4 login-logo"
          src="/GreenLens-Logo.svg"
          alt="GreenLens logo"
        />
        <h1 className="h3 mb-3 fw-normal">Please Login</h1>

        {message && <p className="form-message">{message}</p>}

        {/* Username */}
        <div className="form-floating">
          <input
            type="text"
            className={`form-control ${errors.username ? "input-error" : ""}`}
            id="floatingUsername"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="floatingUsername">Username</label>
          {errors.username && <p className="error-text">{errors.username}</p>}
        </div>

        {/* Password */}
        <div className="form-floating">
          <input
            type="password"
            className={`form-control ${errors.password ? "input-error" : ""}`}
            id="floatingPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="floatingPassword">Password</label>
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <div className="checkbox mb-3">
          <label>
            <input type="checkbox" value="remember-me" /> Remember me
          </label>
        </div>

        <button
          className="btn btn-success w-100 py-2"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-3 mb-0 text-muted">
          Don’t have an account?{" "}
          <a href="/register" className="create-account-link">
            Create one
          </a>
        </p>

        <p className="mt-5 mb-3 text-muted small">© 2025 GreenLens</p>
      </form>
    </main>
  );
};

export default Login;
