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

  // Regex for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username
    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // First name
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required.";
    }

    // Last name
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required.";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters long and include one uppercase, one lowercase, and one number.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("");
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setMessage("");

      const res = await fetch("https://greenlens-50r4.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setMessage("Registration successful! You can now log in.");
      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
      });
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <form id="registerForm" className="register--form" onSubmit={handleSubmit}>
        <h2 className="form--title">Create an Account</h2>
        {message && <div id="message">{message}</div>}

        <div className="register--your-info">
          {/* Username */}
          <div className="form--group">
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
            {errors.username && <p className="register--error">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="form--group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="JohnDoe@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="register--error">{errors.email}</p>}
          </div>

          {/* First Name */}
          <div className="form--group">
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              placeholder="John"
              value={formData.first_name}
              onChange={handleChange}
            />
            {errors.first_name && <p className="register--error">{errors.first_name}</p>}
          </div>

          {/* Last Name */}
          <div className="form--group">
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleChange}
            />
            {errors.last_name && <p className="register--error">{errors.last_name}</p>}
          </div>

          {/* Password */}
          <div className="form--group">
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
            {errors.password && <p className="register--error">{errors.password}</p>}
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
  );
}


