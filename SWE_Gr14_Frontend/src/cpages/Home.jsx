// src/cpages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../cstyles/Home.scss";

function Home() {
  const [view, setView] = useState("products");
  const [productSuggestions, setProductSuggestions] = useState([]);
  const navigate = useNavigate();

useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8000/get_product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            search: "",
            category: [""],
          }),
        });

        const data = await response.json();
        console.log("Response from server:", data);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const suggestions = data.products.map((product) => ({
          name: product.product_name,
          product_id: product.product_id,
          price: `₹${product.product_price}`,
          rating: product.product_rating,
          stock: product.product_stock,
        //   flags: product.product_flags,
          description: product.product_description,
          shop: {
            name: product.shop_name,
            rating: product.shop_rating,
            location: product.shop_location,
          },
        }));

        setProductSuggestions(suggestions);
        // console.log("Updated productSuggestions:", suggestions); // Debugging log
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    // console.log("Heyaskjdnajsdn:", productSuggestions);
    fetchProducts();
  }, []);

  return (
    <>
      <Header view={view} setView={setView} />

      <div className="home-container">
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
                    <strong>{product.name}</strong>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem("product_id", product.product_id); // Store product_id in localStorage
                      navigate("/ViewProduct"); // Navigate to ViewProduct page
                    }}
                    className="view-product-btn"
                  >
                    View Product
                  </button>
                </div>

                <div className="product-details">
                  <div className="row-info">Price: {product.price}</div>
                  <div className="row-info">
                    Stock: {product.stock} | Rating: {product.rating} ⭐ |
                    Flags: {product.flags}
                  </div>
                </div>

                <div className="shop-info">
                  <div className="row-info">
                    <strong>{product.shop.name}</strong> ({product.shop.rating}{" "}
                    ⭐)
                  </div>
                  <div className="shop-details"><strong>Location:</strong> {product.shop.location}</div>
                </div>
              </div>
            ))}

          {/* {view === "shops" &&
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
                            </div>
                        ))} */}
        </div>
      </div>
    </>
  );
}

export default Home;
