import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import "../cstyles/ViewProduct.scss";

function ViewProduct() {
  const [view, setView] = useState("products");
  const navigate = useNavigate();
  const productId = localStorage.getItem("product_id"); // Gets the product ID from localStorage
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      setUserId(JSON.parse(userData).user_id); // Set userId only once when the component mounts
    }
  }, []);

  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);
  const [userReview, setUserReview] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedProductId = localStorage.getItem("product_id"); // Retrieve product_id from localStorage
    if (storedProductId) {
      fetchProductDetails(storedProductId); // Fetch product details
      fetchReviews(storedProductId); // Fetch reviews
    }
  }, []);

  const fetchReviews = async (productId) => {
    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:8000/c_get_reviews", {
        product_id: productId,
      });

      if (response.data.success) {
        console.log("Reviews fetched:", response.data.reviews);
        setReviews(response.data.reviews);
      } else {
        setError(response.data.error || "Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to load reviews. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductDetails = async (productId) => {
    try {
      console.log("Fetching product details for ID:", productId);
      const response = await fetch(
        `http://localhost:8000/c_get_product_details/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product_id: productId }),
        }
      );
      const data = await response.json();
      console.log("Response from server:", data);
      if (!response.ok) {
        throw new Error("Failed to fetch product details");
      }
      if (data.error) {
        throw new Error(data.error);
      }
      console.log("Product details fetched:", data);
      setProduct({
        name: data.product_details.product_name,
        price: `₹${data.product_details.product_price}`,
        rating: data.product_details.product_rating,
        description: data.product_details.product_description,
        stock: data.product_details.product_stock,
        images: data.product_details.product_images,
      });
      setShop({
        shopName: data.product_details.shop_name,
        shopRating: data.product_details.shop_rating,
        shopType: data.product_details.shop_type,
        shopEmail: data.product_details.shop_email,
        shopPhoneNumber: data.product_details.shop_phone_number,
        shopAddress: data.product_details.shop_address,
        shopLocation: data.product_details.shop_google_map_link,
        shopPic: data.product_details.shop_images,
        shopReviews: data.product_details.shop_review,
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const handleReviewSubmit = async () => {
    if (!userId) {
      alert("Please log in to submit a review");
      return;
    }

    if (!userReview.trim()) {
      alert("Please write a review before submitting");
      return;
    }

    if (!userRating || userRating < 1 || userRating > 5) {
      alert("Please provide a rating between 1 and 5");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:8000/c_add_review", {
        user_id: userId,
        product_id: productId,
        rating: parseInt(userRating),
        review_text: userReview,
      });

      if (response.data.success) {
        alert("Your review has been submitted successfully!");
        setUserReview("");
        setUserRating(5);
        setIsReviewSubmitted(true);
        // Fetch updated reviews after submitting
        fetchReviews(productId);
      } else {
        alert(response.data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      console.log("Adding product to wishlist:", productId);
      const response = await fetch("http://localhost:8000/c_add_to_wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to wishlist");
      }

      const data = await response.json();
      console.log("Product added to wishlist:", data);
      alert("Product successfully added to your wishlist!");
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
      alert("Failed to add product to wishlist. Please try again.");
    }
  };

  const handleFollow = async () => {
    if (!userId) {
      alert("Please log in to follow a product");
      navigate("/clogin");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/c_follow_product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("You are now following this product!");
      } else {
        alert(data.error || "Failed to follow the product.");
      }
    } catch (error) {
      console.error("Error following product:", error);
      alert("An error occurred while following the product. Please try again.");
    }
  };

  const handleFlagSubmit = async () => {
    if (!userId) {
      alert("Please log in to flag a product");
      return;
    }

    if (!flagReason.trim()) {
      alert("Please provide a reason for flagging this product");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:8000/c_add_flag", {
        user_id: userId,
        product_id: productId,
        flag_reason: flagReason,
      });

      if (response.data.success) {
        alert("Product has been flagged successfully!");
        setFlagReason("");
      } else {
        alert(response.data.error || "Failed to flag the product");
      }
    } catch (error) {
      console.error("Error flagging product:", error);
      alert("Failed to flag the product. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!product && !shop) {
    return <div>Loading...</div>; // Show a loading state while data is being fetched
  }

  return (
    <>
      <Header view={view} setView={setView} />

      <div className="view-product-container">
        {/* Product details section */}
        <div className="shop-details">
          <h2>{product.name}</h2>
          <p>
            <strong>Price:</strong> {product.price}
          </p>
          <p>
            <strong>Rating:</strong> {product.rating} ⭐
          </p>
          <p>
            <strong>Description:</strong> {product.description}
          </p>
          <p>
            <strong>Stock:</strong> {product.stock}
          </p>

          <div className="product-actions">
            <button className="follow-btn" onClick={handleFollow}>
              Follow Product
            </button>
            <button className="wishlist-btn" onClick={handleAddToWishlist}>
              Add to Wishlist
            </button>
          </div>
        </div>

        {/* Shop details section */}
        <div className="shop-details">
          <div className="shop-header">
            <h3>{shop.shopName}</h3>
            <button className="follow-shop-btn">Follow Shop</button>
          </div>
          <p>
            <strong>Rating:</strong> {shop.shopRating} ⭐
          </p>
          <p>
            <strong>Type:</strong> {shop.shopType}
          </p>
          <p>
            <strong>Email:</strong> {shop.shopEmail}
          </p>
          <p>
            <strong>Phone:</strong> {shop.shopPhoneNumber}
          </p>
          <p>
            <strong>Address:</strong> {shop.shopAddress}
          </p>
          <p>
            <strong>Location:</strong> {shop.shopLocation}
          </p>
        </div>

        {/* Reviews section */}
        <div className="reviews-section">
          <h3>Reviews</h3>

          {isLoading ? (
            <p>Loading reviews...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.review_id} className="review-card">
                <img
                  src={review.profile_pic || "/default-avatar.jpg"}
                  alt={`${review.first_name || "User"}`}
                  className="review-avatar"
                />
                <div>
                  <strong>
                    {review.first_name} {review.last_name || review.email}
                  </strong>
                  <p>{review.review_text}</p>
                  <div className="user-rating">{review.rating} ⭐</div>
                  <small>
                    {new Date(review.date_added).toLocaleDateString()}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <p>
              No reviews yet for this product. Be the first to leave a review!
            </p>
          )}

          <div className="user-review-form">
            <h4>Submit Your Review</h4>
            {!userId && (
              <p className="login-notice">Please login to submit a review</p>
            )}
            <textarea
              placeholder="Write your review..."
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              disabled={!userId || isLoading}
            />
            <div className="rating-input">
              <label>Rating:</label>
              <select
                value={userRating}
                onChange={(e) => setUserRating(e.target.value)}
                disabled={!userId || isLoading}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>

            <button
              onClick={handleReviewSubmit}
              disabled={!userId || isLoading || !userReview.trim()}
              className="submit-review-btn"
            >
              {isLoading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>

        {/* Flag section */}
        <div className="flag-section">
          <h3>Flag Product</h3>
          <textarea
            placeholder="Enter reason for flagging this product..."
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
          />
          <button className="flag-btn" onClick={handleFlagSubmit}>
            Submit Flag
          </button>
        </div>
      </div>
    </>
  );
}

export default ViewProduct;
