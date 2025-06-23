import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { account } from "./appwriteConfig";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) return alert("Passwords do not match");
    try {
      await account.updateRecovery(userId, secret, password, confirm);
      alert("Password reset successful!");
      navigate("/login");
    } catch (err) {
      console.error("Reset error:", err);
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleReset}>
      <h2>Reset Your Password</h2>
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  );
}
const containerStyle = {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  };
  
  const formStyle = {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center"
  };
  
  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
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
    fontSize: "16px",
    cursor: "pointer",
  };
  
export default ResetPassword;
