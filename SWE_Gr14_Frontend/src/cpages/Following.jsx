// src/cpages/Following.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../cstyles/Following.scss";

function Following() {
  const [view, setView] = useState("products");
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [shopSuggestions, setShopSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFollowedProducts = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user_data"));
        if (!userData || !userData.user_id) {
          console.error("User ID not found in localStorage");
          navigate("/clogin");
          return;
        }

        console.log("User ID from localStorage:", userData.user_id);
        const response = await fetch(
          "http://localhost:8000/c_get_followed_products",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userData.user_id }),
          }
        );

        // console.log("Response from server:", response.json());

        if (!response.ok) {
          throw new Error("Failed to fetch followed products");
        }

        const data = await response.json();
        console.log("Followed products fetched:", data.followed_products);
        setProductSuggestions(data.followed_products || []);
      } catch (error) {
        console.error("Error fetching followed products:", error);
      }
    };

    fetchFollowedProducts();
  }, []);

  const handleUnfollow = async (productId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user_data"));
      if (!userData || !userData.user_id) {
        console.error("User ID not found in localStorage");
        navigate("/clogin");
        return;
      }

      const response = await fetch("http://localhost:8000/c_unfollow_product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.user_id,
          product_id: productId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to unfollow the product");
      }

      const data = await response.json();
      if (data.success) {
        alert("Product unfollowed successfully!");
        setProductSuggestions((prevSuggestions) =>
          prevSuggestions.filter((product) => product.product_id !== productId)
        );
      } else {
        alert(data.error || "Failed to unfollow the product.");
      }
    } catch (error) {
      console.error("Error unfollowing product:", error);
      alert(
        "An error occurred while unfollowing the product. Please try again."
      );
    }
  };

  return (
    <>
      <Header view={view} setView={setView} />

      <div className="Following-container">
        <div className="view-toggle">
          <button
            className={view === "products" ? "active" : ""}
            onClick={() => setView("products")}
          >
            Products
          </button>
          <button
            className={view === "shops" ? "active" : ""}
            onClick={() => setView("shops")}
          >
            Shops
          </button>
        </div>

        <div className="suggestions">
          {view === "products" &&
            productSuggestions.map((product, index) => (
              <div key={index} className="suggestion-card">
                <div className="product-top-row">
                  <div>
                    <strong>{product.product_name}</strong>
                  </div>
                  <button
                    onClick={() =>
                      localStorage.setItem("product_id", product.product_id) ||
                      navigate("/ViewProduct/")
                    }
                    className="view-shop-btn"
                  >
                    View Product
                  </button>
                </div>

                <div className="product-details">
                  <div className="row-info">Price: {product.product_price}</div>
                  <div className="row-info">
                    Stock: {product.product_stock} | Rating:{" "}
                    {product.product_rating} ⭐
                  </div>
                </div>

                <div className="shop-info">
                  <div className="row-info">
                    <strong>{product.shop_name}</strong> ({product.shop_rating}{" "}
                    ⭐)
                  </div>
                </div>

                <div className="card-bottom">
                  <button
                    className="unfollow-btn"
                    onClick={() => handleUnfollow(product.product_id)}
                  >
                    Unfollow
                  </button>
                </div>
              </div>
            ))}

          {view === "shops" &&
            shopSuggestions.map((shop, index) => (
              <div key={index} className="suggestion-card">
                <div className="shop-top-row">
                  <div>
                    <strong>{shop.name}</strong>
                  </div>
                  <button
                    className="view-shop-btn"
                    onClick={() =>
                      navigate(
                        `/shops/${shop.name.toLowerCase().replace(/\s+/g, "-")}`
                      )
                    }
                  >
                    Browse Shop
                  </button>
                </div>
                <div className="row-info">Rating: {shop.rating} ⭐</div>
                <div className="row-info">Address: {shop.details}</div>

                <div className="card-bottom">
                  <button className="unfollow-btn">Unfollow</button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default Following;
