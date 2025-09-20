// src/cpages/BrowseShop.jsx
import { useParams } from "react-router-dom";
import Header from "./Header";
import "../cstyles/BrowseShop.scss";

function BrowseShop() {
  const { shopId } = useParams();

  const shopDetails = {
    shopName: "Electronics Hub",
    shopRating: "4.6",
    shopType: "Electronics",
    shopEmail: "contact@electronicshub.com",
    shopPhoneNumber: "+91 9876543210",
    shopAddress: "MG Road, Bangalore",
    shopLocation: "https://goo.gl/maps/example123",
    shopPic: "https://via.placeholder.com/120x120.png?text=Shop+Pic",
  };

  const productList = [
    {
      name: "Laptop",
      price: "₹75,000",
      stock: "20",
      rating: "4.5",
    },
    {
      name: "Headphones",
      price: "₹3,500",
      stock: "50",
      rating: "4.2",
    },
  ];

  return (
    <>
      <Header />
      <div className="browse-shop-container">
        <div className="shop-profile">
          <img src={shopDetails.shopPic} alt="Shop" />

          <div className="shop-profile-content">
            <div className="shop-info-text">
              <h2>{shopDetails.shopName}</h2>
              <div>⭐ {shopDetails.shopRating}</div>
              <div>Type: {shopDetails.shopType}</div>
              <div>Email: {shopDetails.shopEmail}</div>
              <div>Phone: {shopDetails.shopPhoneNumber}</div>
              <div>Address: {shopDetails.shopAddress}</div>
              <a
                href={shopDetails.shopLocation}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Map
              </a>
            </div>
            <button className="follow-shop-btn">Follow Shop</button>
          </div>
        </div>

        <div className="suggestions">
          {productList.map((product, index) => (
            <div key={index} className="suggestion-card">
              <div className="product-top-row">
                <div>
                  <strong>{product.name}</strong>
                </div>
                <button
                  onClick={() =>
                    navigate(
                      `/shops/${product.shop.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`
                    )
                  }
                  className="view-shop"
                >
                  View Product
                </button>
              </div>
              <div className="row-info">Price: {product.price}</div>
              <div className="row-info">
                Stock: {product.stock} | Rating: {product.rating} ⭐
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default BrowseShop;
