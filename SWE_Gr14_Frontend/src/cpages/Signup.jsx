import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../cstyles/Signup.scss"; // Adjust the path as necessary
function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const registerObject = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch("http://localhost:8000/c_register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerObject),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      const data = await response.json();

      console.log("Signup response:", data);

      // Optionally store OTP or server response here
      localStorage.setItem(
        "signupData",
        JSON.stringify({ ...registerObject, user_id: data.user_id, gmail: data.email }) // corrected 'datagmail' to 'data.gmail'
      );

      alert(
        data.message || "Signup successful! Please check your email for OTP."
      );
      navigate("/otp", { state: { email } });
    } catch (error) {
      console.error("Signup error:", error);
      alert("Failed to sign up. Please try again.");
    }
  };

  return (
    <div className="signup-card">
      <h2>Create Your Account</h2>
      <form onSubmit={handleSignup}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
