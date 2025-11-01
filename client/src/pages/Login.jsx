import { useState } from "react";
import "./Login.css";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!identifier || !password) {
      setMessage("⚠️ Please fill out both fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://greenlens-50r4.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      setMessage("✅ Login successful!");
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
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

        {message && <p className="text-muted">{message}</p>}

        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            id="floatingInput"
            placeholder="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <label htmlFor="floatingInput">Username</label>
        </div>

        <div className="form-floating">
          <input
            type="password"
            className="form-control"
            id="floatingPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="floatingPassword">Password</label>
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
