import React, { useState } from "react";
import "./Register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Basic validation
    if (!formData.username) newErrors.username = "Username is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.first_name) newErrors.first_name = "First name is required.";
    if (!formData.last_name) newErrors.last_name = "Last name is required.";
    if (!formData.password) newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("");
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setMessage("");

      // 🔗 Connect to backend
      const res = await fetch("https://greenlens-ez5z.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setMessage("✅ Registration successful! You can now log in.");
      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
      });
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="main">
        <form id="registerForm" className="register--form" onSubmit={handleSubmit}>
          <h2 className="form--title">Create an Account</h2>
          {message && <div id="message">{message}</div>}

          <div className="register--your-info">
            {/* Username */}
            <div className="form--group" id="username-container">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Username"
                maxLength="20"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <div className="register--error">{errors.username}</div>}
            </div>

            {/* Email */}
            <div className="form--group" id="email-container">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="JohnDoe@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="register--error">{errors.email}</div>}
            </div>

            {/* First Name */}
            <div className="form--group" id="first_name-container">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
              />
              {errors.first_name && <div className="register--error">{errors.first_name}</div>}
            </div>

            {/* Last Name */}
            <div className="form--group" id="last_name-container">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
              />
              {errors.last_name && <div className="register--error">{errors.last_name}</div>}
            </div>

            {/* Password */}
            <div className="form--group" id="password-container">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                maxLength="30"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <div className="register--error">{errors.password}</div>}
            </div>

            {/* Submit Button */}
            <input
              type="submit"
              className="form-button"
              value={loading ? "Registering..." : "Register"}
              disabled={loading}
            />
          </div>
        </form>
      </main>
    </>
  );
}
