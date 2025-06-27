import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { account } from "./appwriteConfig";
import emailjs from "emailjs-com";
import { useRef } from "react";
import "./Welcome.css";
import { Client, Account } from "appwrite";


emailjs.init(import.meta.env.VITE_EMAILJS_USER_ID);

// ✅ Create Appwrite Client and Account manually with JWT
const client = new Client()
  .setEndpoint("https://syd.cloud.appwrite.io/v1")
  .setProject("6858d7e50002f2db3a84"); // your actual project ID

const jwt = localStorage.getItem("auth-token");
if (jwt) {
  client.setJWT(jwt);
}
const account = new Account(client);


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


        const user = await account.get();
        setUser(user);
        console.log("👤 User fetched:", user);
        console.log("🔍 Email verified?", user.emailVerification);

        if (!localStorage.getItem(`greeted:${user.$id}`)) {
          const isNewUser = !localStorage.getItem(`welcomeSent:${user.$id}`);
          const message = isNewUser
            ? `Welcome${user.name ? `, ${user.name}` : ""}!`
            : `Welcome back${user.name ? `, ${user.name}` : ""}!`;
          console.log("User exists");
          localStorage.setItem(`greeted:${user.$id}`, "true");
        }

        if (
          user.emailVerification &&
          !localStorage.getItem(`welcomeSent:${user.$id}`) &&
          !hasSent.current
        ) {
          console.log("📨 Condition passed, preparing to send email...");
          hasSent.current = true;

          await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            {
              username: user.name,
              email: user.email,
            },
            import.meta.env.VITE_EMAILJS_USER_ID
          );

          console.log("✅ Welcome Email Sent to verified user");
          localStorage.setItem(`welcomeSent:${user.$id}`, "true");
        }

        // Trigger card reveal after envelope animation
        setTimeout(() => setCardRevealed(true), 1500);
      } catch (err) {
        console.error("Not logged in or verification failed:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate, location]);

  const handleLogout = async () => {
    await account.deleteSessions();
    localStorage.removeItem("welcomeSent");
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
              <button
                className="welcome-signup-btn"
                onClick={() => navigate("/")}
              >
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
