import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { account } from "./appwriteConfig";

function Welcome() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await account.get();
        setUser(res);
      } catch (err) {
        console.error("Not logged in:", err);
        setUser(null); // Optional: fallback to guest
      }
    };
  
    fetchUser();
  }, []);
  

  const handleLogout = async () => {
    await account.deleteSessions();
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
