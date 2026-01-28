import React, { useState } from "react";
import { loginApi } from "../api/authApi";

const styles = {
  container: {
   background: "linear-gradient(45deg, #06143fff, #0d253aff)",
    maxWidth: "320px",
    margin: "80px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
  },
  title: {
    textAlign: "center",
    marginBottom: "16px",
    color: "#fff"
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  },
  button: {
    width: "100%",
    padding: "8px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#5b799aff",
    color: "#fff",
    cursor: "pointer"
  },
  error: {
    color: "red",
    marginBottom: "8px",
    textAlign: "center"
  }
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginApi(email, password);
      localStorage.setItem("token", data.token);
      onLogin(data.token);
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={styles.button} type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
