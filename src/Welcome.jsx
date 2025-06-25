import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { account } from "./appwriteConfig";
import emailjs from "emailjs-com";
import { useRef } from "react";

emailjs.init(import.meta.env.VITE_EMAILJS_USER_ID);





function Welcome() {
  const [user, setUser] = useState(null);
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
          alert(message);
          console.log("User exists");
          localStorage.setItem(`greeted:${user.$id}`, "true");
        }
        
      
        if (
          user.emailVerification &&
          !localStorage.getItem(`welcomeSent:${user.$id}`) &&
          !hasSent.current
        ){
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
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {user ? (
        <>
          <h1>Welcome, {user.name || user.email}!</h1>
          {user.emailVerification ? (
            <p style={{ color: "green" }}>
              ✅ Your account is verified! You may now log in.
            </p>
          ) : (
            <p style={{ color: "orange" }}>
              📨 Please check your email to verify your account before logging
              in again.
            </p>
          )}

          <div style={{ marginTop: "20px" }}>
            <button onClick={handleLogout} style={buttonStyle}>
              Log Out
            </button>
            <button
              onClick={() => navigate("/")}
              style={{
                ...buttonStyle,
                marginLeft: "10px",
                backgroundColor: "#4f46e5",
              }}
            >
              Go to Sign Up
            </button>
          </div>
        </>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
  backgroundColor: "#e11d48",
  color: "#fff",
};

export default Welcome;
