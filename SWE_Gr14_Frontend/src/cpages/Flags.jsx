// src/cpages/Review.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../cstyles/Flags.scss";

function Flags() {
  const [flags, setFlags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user_data"));
        if (!userData || !userData.user_id) {
          console.error("User ID not found in localStorage");
          navigate("/clogin");
          return;
        }

        const response = await fetch("http://localhost:8000/fetch_flags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userData.user_id }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch flags");
        }

        const data = await response.json();
        console.log("Flags fetched:", data.flags);
        setFlags(data.flags || []);
      } catch (error) {
        console.error("Error fetching flags:", error);
      }
    };

    fetchFlags();
  }, []);

  return (
    <>
      <Header view="flags" setView={() => {}} />

      <div className="review-container">
        <div className="suggestions">
          {flags.map((flag, index) => (
            <div key={index} className="suggestion-card">
              <div className="product-top-row">
                <div>
                  <strong>{flag.product_name}</strong>
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem("product_id", flag.product_id);
                    navigate("/ViewProduct");
                  }}
                  className="view-shop-btn"
                >
                  View Product
                </button>
              </div>

              <div className="product-details">
                <div className="row-info">Price: ₹{flag.product_price}</div>
                <div className="row-info">
                  Stock: {flag.product_stock} | Rating: {flag.product_rating} ⭐
                </div>
              </div>

              <div className="shop-info">
                <div className="row-info">
                  <strong>{flag.shop_name}</strong> ({flag.shop_rating} ⭐)
                </div>
                <div className="shop-details">{flag.shop_address}</div>
              </div>

              <div className="card-bottom">
                <div className="submitted-review">
                  <div>
                    <strong>Status:</strong> {"Pending"}
                  </div>
                  <div>
                    <strong>Reason:</strong> {flag.flag_reason}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Flags;
