import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../sStyles/Otp.scss';

function Otp() {
  const [inputOtp, setInputOtp] = useState('');
  const navigate = useNavigate();

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const storedData = JSON.parse(localStorage.getItem('signupData'));
    const otpRequestObject = {
      user_id: storedData?.user_id,
      otp: inputOtp,
    };
    
    console.log('OTP Request Object:', otpRequestObject);
    try {
      const response = await fetch("http://localhost:8000/s_verify_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(otpRequestObject),
      });

      const data = await response.json();
      console.log(data);
      console.log("Server response:", data);

      if (data.success) {
        alert("OTP Verified Successfully!");
        navigate("/sprofiledetails");
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2>Enter OTP</h2>
        <form onSubmit={handleOtpSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={inputOtp}
            onChange={(e) => setInputOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      </div>
    </div>
  );
}

export default Otp;
