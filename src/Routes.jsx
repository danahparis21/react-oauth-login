// Routes.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App"; // your Sign Up form
import Login from "./Login";
import Welcome from "./Welcome";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
