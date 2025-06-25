import React, { useState, useEffect } from "react";
import { account } from "./appwriteConfig";
import { ID } from "appwrite";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import emailjs from "emailjs-com";
import "./App.css";

emailjs.init(import.meta.env.VITE_EMAILJS_USER_ID);

function App() {
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
    if (score === 1) return { label: "Weak", color: "red" };
    if (score === 2) return { label: "Medium", color: "orange" };
    if (score === 3) return { label: "Strong", color: "green" };
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { label } = getStrength();
    if (label !== "Strong") return alert("Password is not strong enough");
    if (!passwordMatch) return alert("Passwords do not match");
    if (!username.trim()) return alert("Please enter a username");
    if (!email.trim()) return alert("Please enter an email address");

    try {
      // ✅ Create the user account
      const res = await account.create(
        ID.unique(),
        email,
        password,
        username.trim()
      );
      console.log("User created:", res);
      alert("Account created successfully!");

      await account.createEmailPasswordSession(email, password);
      console.log("User session created.");

      await account.createVerification("http://localhost:5173/welcome");
      alert("A verification email has been sent. Please check your inbox!");

      navigate("/welcome");
    } catch (err) {
      if (err.code === 429) {
        alert("Too many requests. Please wait a minute and try again.");
      } else if (err.code === 409) {
        alert("User already exists. Try logging in.");
      } else {
        console.error("Appwrite signup error:", err);
        alert(err.message || "Signup failed");
      }
    }
  };

  // useEffect(() => {
  //   const checkUser = async () => {
  //     try {
  //       const user = await account.get();
  //       if (user) {
  //         navigate("/welcome");
  //       }
  //     } catch (err) {
  //       console.log("Not logged in");
  //     }
  //   };

  //   checkUser();
  // }, []);

  return (
    <div style={containerStyle} className="animated-bg">
      <div
        className="glass-circle"
        style={{
          position: "absolute",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          top: "20%",
          left: "10%",
          zIndex: 0,
        }}
      ></div>

      <div
        className="glass-circle"
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(15px)",
          bottom: "10%",
          right: "15%",
          zIndex: 0,
        }}
      ></div>

      <div style={formWrapperStyle}>
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
                  height: "8px",
                  borderRadius: "4px",
                  backgroundColor: getStrength().color,
                  transition: "all 0.3s ease",
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
              <li style={{ color: isLongEnough ? "green" : "#f79862" }}>
                {isLongEnough ? "✓" : "✗"} At least 8 characters
              </li>
              <li style={{ color: hasUppercase ? "green" : "#f79862" }}>
                {hasUppercase ? "✓" : "✗"} At least one uppercase letter
              </li>
              <li style={{ color: hasNumber ? "green" : "#f79862" }}>
                {hasNumber ? "✓" : "✗"} At least one number
              </li>
            </ul>
          )}

          <button type="submit" style={buttonStyle}>
            Sign Up
          </button>
          <button
            type="button"
            onClick={() =>
              account.createOAuth2Session(
                "google",
                "http://localhost:5173/welcome", // Redirect on success
                "http://localhost:5173/" // Redirect on failure
              )
            }
            style={{
              ...buttonStyle,
              backgroundColor: "#DB4437",
              marginTop: "10px",
            }}
          >
            Sign in with Google
          </button>

          <p style={{ textAlign: "center", marginTop: "10px" }}>
            Already have an account? <Link to="/login">Log In</Link>
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
  background: "linear-gradient(-45deg, #6b4f3b, #8b7e74, #5c5148, #92877d)",
  backgroundSize: "400% 400%",
  fontFamily: "'Lora', serif",
};

const formWrapperStyle = {
  width: "100%",
  maxWidth: "420px",
  padding: "30px",
  borderRadius: "20px",
  // glass effect
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(12px) saturate(160%)",
  WebkitBackdropFilter: "blur(12px) saturate(160%)",
  boxShadow: "0 25px 45px rgba(0, 0, 0, 0.1)",
  borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
  borderTop: "1px solid rgba(255, 255, 255, 0.2)",
  color: "#fff",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: "14px",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  fontSize: "16px",
  outline: "none",
  transition: "all 0.3s ease",
  fontFamily: "'Lora', serif",
  color: "#fff",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",

  "&:focus": {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderColor: "rgba(255, 255, 255, 0.5)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },

  "&::placeholder": {
    color: "rgba(255, 255, 255, 0.7)",
  },
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "rgba(125, 90, 80, 0.7)",
  color: "#fff",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  transition: "all 0.3s ease",
  letterSpacing: "0.5px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(5px)",

  "&:hover": {
    backgroundColor: "rgba(125, 90, 80, 0.9)",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
    transform: "translateY(-1px)",
  },

  "&:active": {
    transform: "translateY(0)",
  },
};

const googleButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#DB4437",
  marginTop: "10px",
};

const toggleButtonStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "#5C4033",
  cursor: "pointer",
  fontWeight: "bold",
  padding: 0,
  fontSize: "14px",
};

const checklistStyle = {
  listStyle: "none",
  paddingLeft: "10px",
  marginBottom: "15px",
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#555",
};

const strengthContainer = {
  marginBottom: "10px",
  backgroundColor: "rgba(255, 255, 255, 0.5)",
  borderRadius: "5px",
  padding: "5px 10px",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
};

export default App;
