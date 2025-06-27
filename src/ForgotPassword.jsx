import React, { useState, useEffect, useRef } from "react";
import { account } from "./appwriteConfig";
import { Link } from "react-router-dom";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ForgotPassword() {
  const formRef = useRef(null);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await account.createRecovery(
        email,
        "https://react-auth-loginui.netlify.app/reset"
      );

      console.log("📨preparing to send email...");
      toast.success(
        "If an account with that email exists, a recovery link has been sent.",
        {
          className: "custom-toast",
        }
      );
    } catch (err) {
      console.error("Recovery error:", err);
      toast.error(err.message || "Something went wrong", {
        className: "custom-toast",
      });
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
    <div className="animated-bg">
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
      <div
        className="glass-circle"
        style={{ width: "220px", height: "220px", top: "10%", left: "10%" }}
      ></div>
      <div
        className="glass-circle"
        style={{ width: "320px", height: "320px", bottom: "5%", right: "10%" }}
      ></div>

      <div className="form-wrapper" ref={formRef}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Forgot Password
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
            style={inputStyle}
          />

          <button type="submit" className="forgotPass-signup-btn">
            Send Recovery Email
          </button>

          <p style={{ textAlign: "center", marginTop: "10px" }}>
            <Link
              to="/login"
              style={{ color: "#d2b575", textDecoration: "none" }}
            >
              Back to Login
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

export default ForgotPassword;
