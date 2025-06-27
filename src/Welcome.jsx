import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { account } from "./appwriteConfig";
import emailjs from "emailjs-com";
import { useRef } from "react";
import './Welcome.css';
import { Client, Account } from "appwrite";

emailjs.init(import.meta.env.VITE_EMAILJS_USER_ID);

function Welcome() {
  const [user, setUser] = useState(null);
  const [cardRevealed, setCardRevealed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const hasSent = useRef(false);

  useEffect(() => {
    const fetchUser = async () => {
      console.log("🌀 useEffect triggered");

      const queryParams = new URLSearchParams(location.search);
      const userId = queryParams.get("userId");
      const secret = queryParams.get("secret");

      try {
        if (userId && secret) {
          await account.updateVerification(userId, secret);
          console.log("✅ Email verified via link!");
        }

        const jwt = localStorage.getItem("auth-token");
        if (!jwt) {
          console.warn("⚠️ No JWT found in localStorage!");
          navigate("/login");
          return;
        }

        // ✅ Apply JWT to authenticate current session
        await account.updateSession(jwt);

        const userData = await account.get();
        setUser(userData);
        console.log("👤 User fetched:", userData);
        console.log("🔍 Email verified?", userData.emailVerification);

        if (!localStorage.getItem(`greeted:${userData.$id}`)) {
          const isNewUser = !localStorage.getItem(`welcomeSent:${userData.$id}`);
          const message = isNewUser
            ? `Welcome${userData.name ? `, ${userData.name}` : ""}!`
            : `Welcome back${userData.name ? `, ${userData.name}` : ""}!`;
          console.log(message);
          localStorage.setItem(`greeted:${userData.$id}`, "true");
        }

        if (
          userData.emailVerification &&
          !localStorage.getItem(`welcomeSent:${userData.$id}`) &&
          !hasSent.current
        ) {
          console.log("📨 Sending welcome email...");
          hasSent.current = true;

          await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            {
              username: userData.name,
              email: userData.email,
            }
          );

          console.log("✅ Welcome Email Sent!");
          localStorage.setItem(`welcomeSent:${userData.$id}`, "true");
        }

        setTimeout(() => setCardRevealed(true), 1500);
      } catch (err) {
        console.error("❌ Login/Verification failed:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate, location]);

  const handleLogout = async () => {
    try {
      await account.deleteSessions(); // clears all sessions
    } catch (err) {
      console.warn("Logout error:", err);
    }
    localStorage.clear();
    navigate("/login");
  };
  
  return (
    <div className="welcome-page">
      {user ? (
        <>
          <div className="envelope-container">
            <div className="envelope">
              <div className="envelope-front"></div>
              <div className="envelope-back"></div>
              <div className="envelope-flap"></div>
            </div>
          </div>

          {cardRevealed && (
            <div className="glow-card">
              <h1>Welcome, {user.name || user.email}!</h1>
              {user.emailVerification ? (
                <p>🎉 Congrats! Your account has been verified.</p>
              ) : (
                <p>📨 Please check your email to verify your account.</p>
              )}
            </div>
          )}

          {cardRevealed && (
            <div className="action-buttons">
              <button className="welcome-logout-btn" onClick={handleLogout}>
                Log Out
              </button>
              <button className="welcome-signup-btn" onClick={() => navigate("/")}>
                Go to Sign Up
              </button>
            </div>
          )}
        </>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default Welcome;