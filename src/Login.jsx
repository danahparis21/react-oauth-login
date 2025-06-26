// Login.jsx
import React, { useState, useEffect, useRef } from "react";

import { account } from "./appwriteConfig";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const formRef = useRef(null);


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await account.createEmailPasswordSession(email, password);
      toast.success("Logged in successfully!", {
        className: "custom-toast",
      });
      navigate("/welcome");
    } catch (err) {
      console.error("Login error:", err);
  
      if (err.code === 429) {
        toast.warning("Too many requests. Please wait a minute.", {
          className: "custom-toast",
        });
      } else if (err.code === 401) {
        toast.error("Invalid credentials. Please try again.", {
          className: "custom-toast",
        });
      } else if (
        err.message === "Failed to fetch" ||
        err.message?.includes("NetworkError") ||
        !navigator.onLine
      ) {
        toast.error("No internet connection. Please check your connection.", {
          className: "custom-toast",
        });
      } else {
        toast.error(err.message || "Login failed. Please try again.", {
          className: "custom-toast",
        });
      }
    }
  };
  

  useEffect(() => {
    const el = formRef.current;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);
    };

    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, []);
  

  return (
    <div style={containerStyle} className="animated-bg">
      <ToastContainer
        position="top-center"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />

      <div className="glass-circle" style={{ width: "220px", height: "220px", top: "10%", left: "10%" }}></div>
      <div className="glass-circle" style={{ width: "320px", height: "320px", bottom: "5%", right: "10%" }}></div>

      <div className="form-wrapper" ref={formRef}>

        <h2 style={headingStyle}>Log In</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <p style={{ textAlign: "center", marginTop: "10px" }}>
            <Link to="/forgot-password" style={{ color: "#d2b575", textDecoration: "none" }}>
              Forgot Password?
            </Link>
          </p>

          <button type="submit" className="signup-btn">Log In</button>

          <button
            type="button"
            className="google-btn"
            onClick={() =>
              account.createOAuth2Session(
                "google",
                "http://localhost:5173/welcome",
                "http://localhost:5173/welcome"
              )
            }
          >
            Log in with Google
          </button>

          <p style={{ textAlign: "center", marginTop: "10px" }}>
            Don’t have an account?{" "}
            <Link to="/" style={{ color: "#d2b575", textDecoration: "none" }}>
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const containerStyle = {
  height: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "'Open Sans', sans-serif",
  position: "relative",
  overflow: "hidden",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: "14px",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(255, 255, 255, 0.25)",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  fontSize: "16px",
  color: "#ffffff",
  transition: "all 0.3s ease",
  fontFamily: "'Open Sans', sans-serif",
  backdropFilter: "blur(6px)",
};

const headingStyle = {
  textAlign: "center",
  marginBottom: "20px",
  color: "#fff",
  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
};



const toggleButtonStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "#d2b575",
  cursor: "pointer",
  fontWeight: "bold",
  padding: 0,
  fontSize: "14px",
};



export default Login;
