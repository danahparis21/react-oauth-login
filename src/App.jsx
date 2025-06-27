import React, { useState, useEffect, useRef } from "react";

import { account } from "./appwriteConfig";
import { ID } from "appwrite";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import emailjs from "emailjs-com";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

emailjs.init(import.meta.env.VITE_EMAILJS_USER_ID);

function App() {
  const formRef = useRef(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const isLongEnough = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordMatch = password === confirm;

  // Password strength logic
  const getStrength = () => {
    let score = 0;
    if (isLongEnough) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;

    if (score === 0) return { label: "", color: "transparent" };
    if (score === 1) return { label: "Weak", color: "#d3825c" }; // muted rust
    if (score === 2) return { label: "Medium", color: "#e0b96a" }; // soft gold
    if (score === 3) return { label: "Strong", color: "#f5e6c5" }; // light champagne
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { label } = getStrength();
    if (label !== "Strong")
      return toast.warning("Password is not strong enough", {
        className: "custom-toast",
      });
    if (!passwordMatch)
      return toast.error("Passwords do not match", {
        className: "custom-toast",
      });
    if (!username.trim())
      return toast.info("Please enter a username", {
        className: "custom-toast",
      });
    if (!email.trim())
      return toast.info("Please enter an email address", {
        className: "custom-toast",
      });
  
      try {
        // 1. Create user
        const res = await account.create(
          ID.unique(),
          email,
          password,
          username.trim()
        );
        console.log("User created:", res);
        toast.success("Account created successfully!", {
          className: "custom-toast",
        });
      
        try {
          // 2. Try creating session (in case not auto-created)
          await account.createEmailPasswordSession(email, password);
          console.log("Session created manually.");
        } catch (sessionErr) {
          if (
            sessionErr.message?.includes("session is active") ||
            sessionErr.code === 401
          ) {
            console.warn("Session already active, skipping manual login");
          } else {
            throw sessionErr; // re-throw unexpected errors
          }
        }
      
        // 3. Send verification
        await account.createVerification(
          "https://react-auth-loginui.netlify.app/welcome"
        );
      
        toast.success("Verification email sent!", {
          className: "custom-toast",
        });
      
        // 4. Create JWT for fallback use (e.g. incognito)
        const jwt = await account.createJWT();
        localStorage.setItem("auth-token", jwt.jwt);
      
        navigate("/welcome");
      } catch (err) {
        if (err.code === 409) {
          toast.error("User already exists. Try logging in.", {
            className: "custom-toast",
          });
        } else if (err.code === 429) {
          toast.warning("Too many requests. Please wait a minute.", {
            className: "custom-toast",
          });
        } else {
          console.error("Appwrite signup error:", err);
          toast.error("Something went wrong. Please try again.", {
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
      <div
        className="glass-circle"
        style={{
          width: "220px",
          height: "220px",
          top: "10%",
          left: "10%",
        }}
      ></div>

      <div
        className="glass-circle"
        style={{
          width: "320px",
          height: "320px",
          bottom: "5%",
          right: "10%",
        }}
      ></div>

      <div className="form-wrapper" ref={formRef}>
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#fff",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          Sign Up
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
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

          {/* Strength Meter */}
          {touched && (
            <div style={strengthContainer}>
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
                }}
              >
                {getStrength().label}
              </span>
            </div>
          )}

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={inputStyle}
          />

          {/* Password checklist */}
          {touched && (
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
          )}

          <button type="submit" className="signup-btn">
            Sign Up
          </button>
          <button
            type="button"
            className="google-btn"
            onClick={async () => {
              try {
                await account.createOAuth2Session(
                  "google",
                  "https://react-auth-loginui.netlify.app/welcome", // ✅ success
                  "https://react-auth-loginui.netlify.app/welcome" // ✅ failure fallback too // failure fallback too // failure page
                );
              } catch (err) {
                console.error("OAuth login failed:", err);
                alert("Google Sign-In failed. Please try again.");
              }
            }}
          >
            Sign in with Google
          </button>

          <p style={{ textAlign: "center", marginTop: "10px" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "#d2b575", textDecoration: "none" }}
            >
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// Styling
const containerStyle = {
  height: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "'Open Sans', sans-serif",

  position: "relative", // to hold glass circles properly
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

  // Hover

  // Focus
  ":focus": {
    outline: "none",
    boxShadow: "0 0 8px rgba(210, 181, 117, 0.4)",
  },

  // Placeholder
  "::placeholder": {
    color: "#fffff",
  },
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#a87740",
  color: "#fff",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  letterSpacing: "0.5px",
  transition: "all 0.3s ease-in-out",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",

  ":hover": {
    backgroundColor: "#c38e57",
    boxShadow: "0 0 12px rgba(255, 193, 107, 0.4)",
  },

  ":active": {
    transform: "scale(0.98)",
  },
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

const checkItem = (isMet) => ({
  color: isMet ? "#bfa16a" : "#d48b5c",
  fontWeight: isMet ? "500" : "400",
});

const strengthContainer = {
  marginBottom: "12px",
  padding: "6px 12px",
  background: "rgba(255, 255, 255, 0.06)",
  borderRadius: "8px",
  backdropFilter: "blur(6px)",
  color: "#fff",
  fontSize: "12px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
};

// const googleButtonStyle = {
//   ...buttonStyle,
//   backgroundColor: "#474640",
//   marginTop: "10px",
// };

// const formWrapperStyle = {
//   width: "100%",
//   maxWidth: "420px",
//   padding: "30px",
//   borderRadius: "20px",
//   background: "rgba(255, 255, 255, 0.08)",
//   backdropFilter: "blur(12px) saturate(160%)",
//   WebkitBackdropFilter: "blur(12px) saturate(160%)",
//   boxShadow: `
//     0 0 20px rgba(255, 255, 255, 0.15),   /* soft white glow */
//     0 4px 30px rgba(0, 0, 0, 0.3),        /* depth shadow */
//     inset 0 1px 2px rgba(255, 255, 255, 0.2), /* inner top light */
//     inset 0 -1px 2px rgba(0, 0, 0, 0.2)       /* inner bottom dark */
//   `,
//   borderLeft: "1px solid rgba(255, 255, 255, 0.18)",
//   color: "#fff",
//   position: "relative",
//   zIndex: 1,
// };
export default App;
