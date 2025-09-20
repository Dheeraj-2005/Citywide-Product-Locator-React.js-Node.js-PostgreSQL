// src/cpages/AddedProducts.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../cstyles/AddedProducts.scss";

function AddedProducts() {
  const [view, setView] = useState("products");
  const [addedProducts, setAddedProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAddedProducts = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user_data"));
        if (!userData || !userData.user_id) {
          console.error("User ID not found in localStorage");
          return;
        }
        console.log("User ID from localStorage:", userData.user_id);
        const response = await fetch("http://localhost:8000/c_get_added_products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userData.user_id }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch added products");
        }

        const data = await response.json();
        console.log("Response from server:", data);
        setAddedProducts(data.products || []);
      } 
      catch (error) {
        console.error("Error fetching added products:", error);
      }
    };

    fetchAddedProducts();
  }, []); // Removed addedProducts from the dependency array

  return (
    <>
      <Header view={view} setView={setView} />

      <div className="review-container">
        <div className="top-bar">
          <button
            className="add-product-btn"
            onClick={() => navigate("/AddProduct")}
          >
            Add Product
          </button>
        </div>

        <div className="suggestions">
          {view === "products" &&
            addedProducts.map((product, index) => (
              <div key={index} className="suggestion-card">
                <div className="product-top-row">
                  <div>
                    <strong>{product.product_name}</strong>
                  </div>
                  <button
                    onClick={() =>{
                        localStorage.setItem("product_id", product.product_id);
                        navigate("/ViewProduct");
                    }}
                    className="view-shop-btn"
                  >
                    View Product
                  </button>
                </div>

                <div className="product-details">
                  <div className="row-info">Price: ₹{product.product_price}</div>
                  <div className="row-info">
                    Stock: {product.product_stock || "N/A"} | Rating:{" "}
                    {product.product_rating} ⭐ | Flags: {product.product_flags || 0}
                  </div>
                </div>

                <div className="shop-info">
                  {product.shop_name ? (
                    <>
                      <div className="row-info">
                        <strong>{product.shop_name}</strong> ({product.shop_rating} ⭐)
                      </div>
                      <div className="shop-details">{product.shop_address}</div>
                    </>
                  ) : (
                    <div className="row-info">Shop details are not available</div>
                  )}
                </div>

                <div className="card-bottom">
                  <button
                    onClick={() => {
                        localStorage.setItem("product_id", product.product_id);
                        navigate("/EditProduct");
                    }}
                    className="edit-product-btn"
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default AddedProducts;
