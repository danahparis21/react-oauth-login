import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { account } from "./appwriteConfig";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ResetPassword() {
  const formRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  // ✅ Move these here AFTER password is defined
  const isLongEnough = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordMatch = password === confirm;

  const getStrength = () => {
    let score = 0;
    if (isLongEnough) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;

    if (score === 0) return { label: "", color: "transparent" };
    if (score === 1) return { label: "Weak", color: "#d3825c" };
    if (score === 2) return { label: "Medium", color: "#e0b96a" };
    if (score === 3) return { label: "Strong", color: "#f5e6c5" };
  };
  const handleReset = async (e) => {
    e.preventDefault();
    const { label } = getStrength();

    if (label !== "Strong") {
      return toast.warning("Password is not strong enough", {
        className: "custom-toast",
      });
    }

    if (!passwordMatch) {
      return toast.error("Passwords do not match", {
        className: "custom-toast",
      });
    }

    try {
      await account.updateRecovery(userId, secret, password, confirm);
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err) {
      console.error("Reset error:", err);
      toast.error(err.message || "Something went wrong");
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
      <ToastContainer position="top-center" autoClose={3500} theme="dark" />
      <div className="glass-circle" style={{ width: "220px", height: "220px", top: "10%", left: "10%" }}></div>
      <div className="glass-circle" style={{ width: "320px", height: "320px", bottom: "5%", right: "10%" }}></div>

      <div className="form-wrapper" ref={formRef}>
        <h2 style={headingStyle}>Reset Password</h2>
        <form onSubmit={handleReset}>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setTouched(true);
              }}
              required
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={toggleButtonStyle}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {touched && (
            <>
              <div style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    height: "6px",
                    borderRadius: "4px",
                    backgroundColor: getStrength().color,
                    width: "100%",
                    transition: "all 0.4s ease",
                  }}
                ></div>
                <span
                  style={{
                    fontSize: "12px",
                    color: getStrength().color,
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {getStrength().label}
                </span>
              </div>

              <ul style={checklistStyle}>
                <li style={{ color: isLongEnough ? "white" : "#f79862" }}>
                  {isLongEnough ? "✓" : "✗"} At least 8 characters
                </li>
                <li style={{ color: hasUppercase ? "white" : "#f79862" }}>
                  {hasUppercase ? "✓" : "✗"} At least one uppercase letter
                </li>
                <li style={{ color: hasNumber ? "white" : "#f79862" }}>
                  {hasNumber ? "✓" : "✗"} At least one number
                </li>
              </ul>
            </>
          )}

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" className="signup-btn">
            Reset Password
          </button>
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

const checklistStyle = {
  listStyle: "none",
  padding: "10px 0",
  margin: "0",
  fontSize: "13px",
  lineHeight: "1.8",
  color: "#eee",
  fontFamily: "'Open Sans', sans-serif",
};



export default ResetPassword;
