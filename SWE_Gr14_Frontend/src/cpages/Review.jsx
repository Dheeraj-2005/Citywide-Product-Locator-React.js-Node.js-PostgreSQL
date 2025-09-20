// src/cpages/Review.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../cstyles/Review.scss";

function Review() {
  const [view, setView] = useState("products");
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user_data"));
        if (!userData || !userData.user_id) {
          console.error("User ID not found in localStorage");
          navigate("/clogin");
          return;
        }

        const response = await fetch("http://localhost:8000/get_user_reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userData.user_id }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user reviews");
        }

        const data = await response.json();
        console.log("User reviews fetched:", data.reviews);
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Error fetching user reviews:", error);
      }
    };

    fetchUserReviews();
  }, []);

  return (
    <>
      <Header view={view} setView={setView} />

      <div className="review-container">
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
            reviews
              .filter((review) => review.product_id) // Filter for product reviews
              .map((review, index) => (
                <div key={index} className="suggestion-card">
                  <div className="product-top-row">
                    <div>
                      <strong>{review.product_name}</strong>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem("product_id", review.product_id);
                        navigate("/ViewProduct");
                      }}
                      className="view-shop-btn"
                    >
                      View Product
                    </button>
                  </div>

                  <div className="product-details">
                    <div className="row-info">
                      Price: ₹{review.product_price}
                    </div>
                    <div className="row-info">
                      Rating: {review.product_rating} ⭐
                    </div>
                    <div className="row-info">
                      Description: {review.product_description}
                    </div>
                  </div>

                  <div className="shop-info">
                    <div className="row-info">
                      <strong>{review.shop_name}</strong> ({review.shop_rating}{" "}
                      ⭐)
                    </div>
                    <div className="shop-details">{review.shop_location}</div>
                  </div>

                  <div className="card-bottom">
                    <div className="submitted-review">
                      <div>
                        <strong>Your Rating:</strong> {review.rating} ⭐
                      </div>
                      <div>
                        <strong>Your Review:</strong> {review.review_text}
                      </div>
                      <div>
                        <strong>Date:</strong> {review.date_added}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

          {view === "shops" &&
            reviews
              .filter((review) => review.shop_name) // Filter for shop reviews
              .map((review, index) => (
                <div key={index} className="suggestion-card">
                  <div className="shop-top-row">
                    <div>
                      <strong>{review.shop_name}</strong>
                    </div>
                    <button
                      className="view-shop-btn"
                      onClick={() =>
                        navigate(
                          `/shops/${review.shop_name
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`
                        )
                      }
                    >
                      Browse Shop
                    </button>
                  </div>
                  <div className="row-info">
                    Rating: {review.shop_rating} ⭐
                  </div>
                  <div className="row-info">
                    Location: {review.shop_location}
                  </div>

                  <div className="card-bottom">
                    <div className="submitted-review">
                      <div>
                        <strong>Your Rating:</strong> {review.rating} ⭐
                      </div>
                      <div>
                        <strong>Your Review:</strong> {review.review_text}
                      </div>
                      <div>
                        <strong>Date:</strong> {review.date_added}
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

export default Review;
