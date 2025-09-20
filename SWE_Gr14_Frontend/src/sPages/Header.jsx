import { Bell, ShoppingCart, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../sstyles/Header.scss";

function Header({ view, setView }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [categories, setCategories] = useState([""]);
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const searchResultsRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const [allSearchProducts, setAllSearchProducts] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsernameAndCategories = async () => {
      try {
        const user_id = JSON.parse(localStorage.getItem("user_data")).user_id;
        if (!user_id) {
          console.error("User ID not found in localStorage");
          navigate("/clogin");
          return;
        }
        const response = await fetch("http://localhost:8000/s_get_username", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user_id,
          }),
        });

        if (!response.ok) {
          console.log("Response from username:", response);
          console.error("Failed to fetch user data");
          return;
        }

        const data = await response.json();
        setUsername(data.username);
        setCategories([
          "All",
          "Electronics",
          "Clothing",
          "Home",
          "Books",
          "Sports",
          "Food",
        ]);
      } catch (error) {
        console.error("Error fetching username and categories:", error);
      }
    };

    fetchUsernameAndCategories();
  }, []);

  const handleNavClick = (path) => {
    if (window.location.pathname === path) {
      return;
    } else {
      navigate(path);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() !== "") {
      searchProducts(e.target.value);
    } else {
      setAllSearchProducts([]);
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const searchProducts = async (term) => {
    try {
      console.log(
        "Searching for:",
        JSON.stringify({
          search: term,
          category: selectedCategories.includes("All")
            ? []
            : selectedCategories,
        })
      );
      const response = await fetch("http://localhost:8000/get_product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          search: term,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Search results:", data);

        setAllSearchProducts(data.products);
        filterProductsByCategories(data.products);

        setShowResults(true);
      } else {
        console.error("Failed to fetch products");
        setAllSearchProducts([]);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setAllSearchProducts([]);
      setSearchResults([]);
    }
  };

  const filterProductsByCategories = (products) => {
    if (selectedCategories.includes("All")) {
      setSearchResults(products);
    } else {
      const filtered = products.filter((product) =>
        selectedCategories.includes(product.category)
      );
      setSearchResults(filtered);
    }
  };

  const handleCategoryClick = (category) => {
    setShowCategoryDropdown(!showCategoryDropdown);
  };

  const toggleCategory = (category) => {
    let newSelectedCategories;

    if (category === "All") {
      if (selectedCategories.includes("All")) {
        return;
      } else {
        newSelectedCategories = ["All"];
      }
    } else {
      if (selectedCategories.includes(category)) {
        newSelectedCategories = selectedCategories.filter(
          (c) => c !== category
        );
        if (newSelectedCategories.length === 0) {
          newSelectedCategories = ["All"];
        }
      } else {
        newSelectedCategories = selectedCategories
          .filter((c) => c !== "All")
          .concat(category);
      }
    }

    setSelectedCategories(newSelectedCategories);

    if (allSearchProducts.length > 0) {
      if (newSelectedCategories.includes("All")) {
        setSearchResults(allSearchProducts);
      } else {
        const filtered = allSearchProducts.filter((product) =>
          newSelectedCategories.includes(product.category)
        );
        setSearchResults(filtered);
      }
    }
  };

  const removeCategory = (categoryToRemove) => {
    let newCategories = selectedCategories.filter(
      (c) => c !== categoryToRemove
    );
    if (newCategories.length === 0) {
      newCategories = ["All"];
    }

    setSelectedCategories(newCategories);

    if (allSearchProducts.length > 0) {
      if (newCategories.includes("All")) {
        setSearchResults(allSearchProducts);
      } else {
        const filtered = allSearchProducts.filter((product) =>
          newCategories.includes(product.category)
        );
        setSearchResults(filtered);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = () => {
    navigate("/ViewProduct");
  };

  return (
    <div className="header-wrapper">
      <header className="top-header">
        <div className="left-group">
          <div className="logo" onClick={() => handleNavClick("/home")}>
            Product <br />
            Locator
          </div>
          <Bell
            className="icon"
            onClick={() => handleNavClick("/notifications")}
          />
        </div>

        <div className="search-container">
          <div className="category-filter-container" ref={categoryDropdownRef}>
            <div
              className="selected-categories"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span>Categories</span>
              <div className="selected-tags">
                {selectedCategories.map((cat) => (
                  <div key={cat} className="category-tag">
                    {cat}
                    <X
                      size={12}
                      className="remove-category"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCategory(cat);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {showCategoryDropdown && (
              <div className="category-dropdown">
                {categories.map((category) => (
                  <div
                    key={category}
                    className={`category-option ${
                      selectedCategories.includes(category) ? "selected" : ""
                    }`}
                    onClick={() => toggleCategory(category)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => {}}
                    />
                    <span>{category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search products..."
              className="search-bar"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="search-icon" size={18} />

            {showResults && (
              <div className="search-results" ref={searchResultsRef}>
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="search-result-item"
                      onClick={() => {
                        console.log("Product ID:", product.product_id);
                        localStorage.setItem("product_id", product.product_id);
                        handleClickOutside();
                      }}
                    >
                      <div className="product-name">{product.product_name}</div>
                      <div className="product-price">
                        ${product.product_price}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No products found</div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="cart-icon" onClick={() => handleNavClick("/swishlist")}>
          <ShoppingCart />
        </div>

        <div className="right-group">
          <div className="profile" onClick={() => handleNavClick("/sprofile")}>
            <img src="/profile.jpg" alt="Profile" className="profile-pic" />
            <span className="username">{username}</span>
          </div>
        </div>
      </header>

      <nav className="nav-bar">
        {[
        //   { label: "Home", path: "/sHome" },
          { label: "Added Products", path: "/sAddedProducts" },
          { label: "Following", path: "/sfollowing" },
          { label: "Reviews", path: "/sreview" },
          { label: "Flags", path: "/sflags" },
        ].map((item) => (
          <button
            key={item.path}
            className={view === item.path ? "active1" : ""}
            onClick={() => {
              setView(item.path);
              handleNavClick(item.path);
            }}
            disabled={window.location.pathname === item.path}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Header;
