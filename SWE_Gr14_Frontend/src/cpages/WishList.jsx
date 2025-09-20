import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../cstyles/WishList.scss";

function WishList() {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user_data"));
        if (!userData || !userData.user_id) {
          console.error("User ID not found in localStorage");
          navigate("/clogin");
          return;
        }

        const response = await fetch("http://localhost:8000/get_wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userData.user_id }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch wishlist");
        }

        const data = await response.json();
        console.log("Wishlist fetched:", data.products);
        setWishlist(data.products || []);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user_data"));
      if (!userData || !userData.user_id) {
        console.error("User ID not found in localStorage");
        navigate("/clogin");
        return;
      }

      const response = await fetch(
        "http://localhost:8000/remove_from_wishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userData.user_id,
            product_id: productId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove product from wishlist");
      }

      const data = await response.json();
      if (data.success) {
        alert("Product removed from wishlist successfully!");
        setWishlist((prevWishlist) =>
          prevWishlist.filter((product) => product.product_id !== productId)
        );
      } else {
        alert(data.error || "Failed to remove product from wishlist.");
      }
    } catch (error) {
      console.error("Error removing product from wishlist:", error);
      alert("An error occurred while removing the product from the wishlist.");
    }
  };

  return (
    <>
      <Header view="wishlist" setView={() => {}} />
      <div className="wishlist-container">
        <h2>Your Wishlist</h2>
        {wishlist.length > 0 ? (
          wishlist.map((product, index) => (
            <div key={index} className="wishlist-card">
              <div className="product-details">
                <h3>{product.product_name}</h3>
                <p>Price: ₹{product.product_price}</p>
                <p>Stock: {product.product_stock}</p>
                <p>Rating: {product.product_rating} ⭐</p>
                <p>Description: {product.product_description}</p>
              </div>
              <div className="shop-details">
                <p>Shop Name: {product.shop_name}</p>
                <p>Shop Rating: {product.shop_rating} ⭐</p>
                <p>Location: {product.shop_location}</p>
              </div>
              <div className="wishlist-actions">
                <button
                  className="view-product-btn"
                  onClick={() => {
                    localStorage.setItem("product_id", product.product_id);
                    navigate("/ViewProduct");
                  }}
                >
                  View Product
                </button>
                <button
                  className="remove-wishlist-btn"
                  onClick={() => handleRemoveFromWishlist(product.product_id)}
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Your wishlist is empty.</p>
        )}
      </div>
    </>
  );
}

export default WishList;
