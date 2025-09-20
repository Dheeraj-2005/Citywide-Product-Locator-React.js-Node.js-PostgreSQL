// src/pages/clogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../sStyles/Login.scss"; // Import the CSS file for styling

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginObject = {
      email, // backend expects lowercase keys
      password,
    };

    try {
      const response = await fetch("http://localhost:8000/s_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginObject),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (data.success) {
        alert("Login successful!");
        console.log("User data:", data);
        localStorage.setItem("user_data", JSON.stringify(data));
        navigate("/shome"); // Adjust route accordingly
      } else {
        alert(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="login-footer">
          Don&apos;t have an account?{" "}
          <span className="login-link" onClick={() => navigate("/ssignup")}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
