import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import SalesOrder from "./components/SalesOrder";
import Delivery from "./components/Delivery";
import Billing from "./components/Billing";
import Reports from "./components/Reports";

const styles = {
  page: {
    minHeight: "100vh",
    margin: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(45deg, #11998e, #38ef7d)",
    fontFamily: "Arial, sans-serif"
  },
  authWrapper: {
    width: "360px",
    paddingBottom: "16px"
  },
  authBottomText: {
    textAlign: "center",
    marginTop: "8px",
    color: "#fff"
  },
  authLinkButton: {
    border: "none",
    background: "none",
    color: "#0044cc",
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
    fontSize: "14px"
  },
  appShell: {
    width: "95%",
    maxWidth: "1100px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "10px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
    padding: "20px 24px",
    boxSizing: "border-box"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },
  title: {
    margin: 0,
    color: "#0b3c5d"
  },
  nav: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  navButton: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    fontSize: "14px"
  },
  logoutButton: {
    padding: "6px 12px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#d9534f",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px"
  }
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [authView, setAuthView] = useState("login"); // "login" or "register"
  const [view, setView] = useState("orders");

  if (!token) {
    if (authView === "register") {
      return (
        <div style={styles.page}>
          <div style={styles.authWrapper}>
            <Register
              onRegisterSuccess={() => setAuthView("login")}
              switchToLogin={() => setAuthView("login")}
            />
          </div>
        </div>
      );
    }

    return (
      <div style={styles.page}>
        <div style={styles.authWrapper}>
          <Login onLogin={setToken} />
          <p style={styles.authBottomText}>
            No account?{" "}
            <button
              type="button"
              style={styles.authLinkButton}
              onClick={() => setAuthView("register")}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.appShell}>
        <header style={styles.header}>
          <h2 style={styles.title}>Sales Order – Delivery – Billing</h2>
          <nav style={styles.nav}>
            <button style={styles.navButton} onClick={() => setView("orders")}>
              Orders
            </button>
            <button
              style={styles.navButton}
              onClick={() => setView("delivery")}
            >
              Delivery
            </button>
            <button
              style={styles.navButton}
              onClick={() => setView("billing")}
            >
              Billing
            </button>
            <button
              style={styles.navButton}
              onClick={() => setView("reports")}
            >
              Reports
            </button>
            <button
              style={styles.logoutButton}
              onClick={() => {
                localStorage.removeItem("token");
                setToken("");
              }}
            >
              Logout
            </button>
          </nav>
        </header>

        {view === "orders" && <SalesOrder token={token} />}
        {view === "delivery" && <Delivery token={token} />}
        {view === "billing" && <Billing token={token} />}
        {view === "reports" && <Reports token={token} />}
      </div>
    </div>
  );
}

export default App;
