import React, { useState } from "react";
import { registerApi } from "../api/authApi";

const styles = {
 
  container: {
    background: "linear-gradient(45deg, #06143fff, #0d253aff)",
    width: "340px",
    padding: "24px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    color:"#fff"
  },
  title: {
    textAlign: "center",
    marginBottom: "16px"
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
  linkButton: {
    border: "none",
    background: "none",
    color: "#1976d2",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline"
  },
  error: {
    color: "red",
    marginBottom: "8px",
    textAlign: "center"
  },
  success: {
    color: "green",
    marginBottom: "8px",
    textAlign: "center"
  },
  footerText: {
    marginTop: "10px",
    textAlign: "center",
    fontSize: "14px"
  }
};

const Register = ({ onRegisterSuccess, switchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await registerApi(name, email, password);
      setMessage("User registered. You can login now.");
      if (onRegisterSuccess) onRegisterSuccess(email, password);
    } catch (err) {
      setError("Register failed");
    }
  };

  return (
   
      <div style={styles.container}>
        <h2 style={styles.title}>Register</h2>
        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            Register
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <button type="button" style={styles.linkButton} onClick={switchToLogin}>
            Login
          </button>
        </p>
      </div>
    
  );
};

export default Register;
