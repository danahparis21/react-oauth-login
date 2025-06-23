// Login.jsx
import { useState } from "react";
import { account } from "./appwriteConfig";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await account.createEmailPasswordSession(email, password);
      alert("Logged in successfully!");
      navigate("/welcome");
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === 429) {
        alert("Too many attempts. Please wait a moment.");
      } else if (err.code === 401) {
        alert("Invalid credentials. Please try again.");
      } else {
        alert(err.message);
      }
    }
  };

  return (
    <div style={loginContainer}>
      <div style={formWrapper}>
        <h2>Log In</h2>
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
            <a href="/forgot-password">Forgot Password?</a>
          </p>

          <button type="submit" style={buttonStyle}>
            Log In
          </button>
          <button
            type="button"
            onClick={() =>
              account.createOAuth2Session(
                "google",
                "http://localhost:5173/welcome",
                "http://localhost:5173/login"
              )
            }
            style={{
              ...buttonStyle,
              backgroundColor: "#DB4437",
              marginTop: "10px",
            }}
          >
            Log in with Google
          </button>

          <p style={{ textAlign: "center", marginTop: "10px" }}>
            Don’t have an account? <Link to="/">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const loginContainer = {
  height: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f9fafb",
};

const formWrapper = {
  width: "100%",
  maxWidth: "400px",
  background: "#fff",
  padding: "30px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: "10px",
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
};

export default Login;
