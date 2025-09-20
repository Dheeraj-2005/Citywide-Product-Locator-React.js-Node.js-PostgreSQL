// src/pages/MainPage.jsx
import { useNavigate } from "react-router-dom";
import "./start.scss";

function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="main-container">
      <div className="header-container">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1 className="main-title">City Wide Product Locator</h1>
      </div>

      <div className="second-container">
        <div className="user-box">
          <h2>Consumer</h2>
          <button onClick={() => navigate("/csignup")}>Signup</button>
          <button onClick={() => navigate("/clogin")}>Login</button>
        </div>

        <div className="seller-box">
          <h2>Seller</h2>
          <button onClick={() => navigate("/ssignup")}>Signup</button>
          <button onClick={() => navigate("/slogin")}>Login</button>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
