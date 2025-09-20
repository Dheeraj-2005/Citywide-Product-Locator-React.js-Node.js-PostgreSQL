import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../cstyles/RoleSelection.scss";

function RoleSelection() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Selected role: ${role}`);
    navigate("/ProfileDetails", { state: { role } });
  };

  return (
    <div className="role-selection-container">
      <div className="role-card">
        <h2>Are you a Seller or Consumer?</h2>
        <form onSubmit={handleSubmit}>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="seller"
                checked={role === "seller"}
                onChange={() => setRole("seller")}
                required
              />
              Seller
            </label>
            <label>
              <input
                type="radio"
                value="consumer"
                checked={role === "consumer"}
                onChange={() => setRole("consumer")}
              />
              Consumer
            </label>
          </div>
          <button type="submit">Next</button>
        </form>
      </div>
    </div>
  );
}

export default RoleSelection;
