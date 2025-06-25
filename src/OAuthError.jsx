import { useLocation, Link } from "react-router-dom";

function OAuthError() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const rawError = queryParams.get("error");

  let errorMessage = "Something went wrong. Please try again.";
  if (rawError) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawError));
      if (parsed.message) errorMessage = parsed.message;
    } catch (e) {
      // fallback to default
    }
  }

  return (
    <div style={{ padding: "2rem", color: "#fff", textAlign: "center" }}>
      <h2>Oops!</h2>
      <p>{errorMessage}</p>
      <Link to="/login" style={{ color: "#c28b56" }}>Go to Login</Link>
    </div>
  );
}

export default OAuthError;
