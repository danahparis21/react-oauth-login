import { useState, useEffect } from "react";
import { account } from "./appwriteConfig";
import { ID } from "appwrite";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import emailjs from 'emailjs-com';

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
      // 1. Create the user account (User exists, but is NOT logged in yet)
      const res = await account.create(
        ID.unique(),
        email,
        password,
        username.trim()
      );
      console.log("User created:", res);
      alert("Account created successfully!");

      // 2. IMPORTANT: Log the user in to create a session
      // This changes the user's role from 'guest' to 'user' for subsequent requests
      await account.createEmailPasswordSession(email, password);
      console.log("User session created.");
      // At this point, the user is authenticated, and subsequent requests
      // will have the 'account' scope.

      // 3. Send verification email (Now it should work because the user is logged in)
      await account.createVerification('http://localhost:5173/welcome');
      alert("A verification email has been sent. Please check your inbox!");

      // 4. Send custom welcome email using EmailJS (This is fine after session)
      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          username: username.trim(), // Use actual username
          email: email, // Use actual email
        },
        import.meta.env.VITE_EMAILJS_USER_ID
      )
      .then((result) => {
        console.log('✅ Email sent:', result.text);
      })
      .catch((error) => {
        console.error('❌ Error sending email:', error);
      });

      // 5. Navigate to the welcome page
      navigate("/welcome");

    } catch (err) {
      if (err.code === 429) {
        alert("Too many requests. Please wait a minute and try again.");
      } else if (err.code === 409) {
        alert("User already exists. Try logging in.");
      } else {
        // Log the full error to understand other potential issues
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
    <div style={containerStyle}>
      <div style={formWrapperStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Sign Up</h2>
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
                "http://localhost:5173/" // Redirect on failure (optional)
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
  backgroundColor: "#f9fafb",
};

const formWrapperStyle = {
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

const toggleButtonStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "#4f46e5",
  cursor: "pointer",
  fontWeight: "bold",
  padding: 0,
  fontSize: "14px",
};

const checklistStyle = {
  listStyle: "none",
  paddingLeft: 0,
  marginBottom: "15px",
  fontSize: "14px",
};

const strengthContainer = {
  marginBottom: "10px",
};

export default App;
