import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../cstyles/ShopDetails.scss";

function ShopDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const session_id = location.state?.session_id || "session123"; // fallback
  const email = location.state?.email || "user@example.com"; // fallback

  const [shopName, setShopName] = useState("");
  const [shopType, setShopType] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopEmail, setShopEmail] = useState("");
  const [shopPhoneNumber, setShopPhoneNumber] = useState("");
  const [shopPic, setShopPic] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const shopObject = {
      session_id,
      email,
      shop_name: shopName,
      shop_type: shopType,
      shop_location: shopLocation,
      shop_email: shopEmail,
      shop_phone_number: shopPhoneNumber,
      shop_pic: shopPic ? shopPic.name : "",
    };

    console.log("Shop Object:", shopObject);

    navigate("/clogin", { state: { shop: shopObject } });
  };

  return (
    <div className="shop-details-container">
      <div className="shop-card">
        <h2>Shop Details</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Shop Name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter Shop Type"
            value={shopType}
            onChange={(e) => setShopType(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter Shop Location"
            value={shopLocation}
            onChange={(e) => setShopLocation(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Enter Shop Email"
            value={shopEmail}
            onChange={(e) => setShopEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Enter Shop Phone Number"
            value={shopPhoneNumber}
            onChange={(e) => setShopPhoneNumber(e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setShopPic(e.target.files[0])}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default ShopDetails;
