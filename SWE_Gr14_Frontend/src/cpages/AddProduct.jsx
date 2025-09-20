import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../cstyles/AddProduct.scss";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function AddProduct() {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    product_name: "",
    product_price: "",
    product_review: "",
    product_rating: "",
    product_description: "",
    product_stock: "",
    product_images: null,
    product_category: "",
  });

  const [shop, setShop] = useState({
    shop_name: "",
    shop_area: "",
    shop_city: "",
    shop_type: "",
    shop_email: "",
    shop_phone_number: "",
    shop_images: null,
    shop_description: "",
    shop_rating: "",
    shop_latitude: null,
    shop_longitude: null,
  });

  const [knownShops, setKnownShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [addingNewShop, setAddingNewShop] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India
  const [searchByID, setSearchByID] = useState(true);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [suggestShops, setSuggestShops] = useState({
    shop_id: "",
    shop_name: "",
    shop_area: "",
    shop_city: "",
  });

  const handleShopChange1 = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    // Prepare updated state
    var updatedSuggestShops = {};
    if (searchByID) {
      updatedSuggestShops = {
        [name]: value,
      };
    } else {
      updatedSuggestShops = {
        ...suggestShops,
        [name]: value,
        shop_id: "",
      };
    }

    setSuggestShops(updatedSuggestShops); // Update state asynchronously

    console.log("Shop details fetched");

    if (["shop_name", "shop_city", "shop_area", "shop_id"].includes(name)) {
      const payload = {
        shop_id: updatedSuggestShops.shop_id || "",
        shop_name: updatedSuggestShops.shop_name || "",
        shop_city: updatedSuggestShops.shop_city || "",
        shop_area: updatedSuggestShops.shop_area || "",
      };

      try {
        console.log("Payload: ", payload);
        const response = await fetch("http://localhost:8000/get_shop_details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("Shop details fetched:", data);
        if (data.success) {
          setKnownShops(data.shops || []);
        } else {
          console.error("Failed to fetch shop details:", data.error);
        }
      } catch (error) {
        console.error("Error fetching shop details:", error);
      }
    }
  };

  //   const [mapEmpty, setMapEmpty] = useState(false)
  const handleShopChange = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    // Update state
    setShop((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Build the query from the input and previous state
    const updatedShop = {
      ...shop,
      [name]: value,
    };

    if (name === "shop_area" || name === "shop_city") {
      const query = `${updatedShop.shop_area || ""}, ${
        updatedShop.shop_city || ""
      }, Telangana, India`.trim();

      if (query) {
        try {
          console.log("Query: ", query);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query
            )}`
          );
          const data = await response.json();
          console.log("Data: ", data);
          if (data.length > 0) {
            setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
            return;
          }
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      }
    }
  };

  const handleMapClick = (lat, lng) => {
    setShop((prev) => ({
      ...prev,
      shop_latitude: lat,
      shop_longitude: lng,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = JSON.parse(localStorage.getItem("user_data"));
    if (!userData?.user_id) {
      alert("User not logged in.");
      navigate("/clogin");
      return;
    }

    const payload = {
      user_id: userData.user_id,
      product_name: product.product_name,
      product_price: product.product_price,
      product_category: product.product_category,
      product_stock: product.product_stock,
      product_rating: parseInt(product.product_rating || 0),
      product_description: product.product_description,
      product_review: product.product_review,
      product_images: [product.product_images?.name || ""],
      shop_id: addingNewShop ? "" : selectedShopId,
      shop_name: shop.shop_name,
      shop_area: shop.shop_area,
      shop_city: shop.shop_city,
      shop_type: shop.shop_type,
      shop_email: shop.shop_email,
      shop_phone_number: shop.shop_phone_number,
      shop_images: [shop.shop_images?.name || ""],
      shop_description: shop.shop_description,
      shop_rating: parseInt(shop.shop_rating || 0),
      shop_latitude: addingNewShop ? shop.shop_latitude : -1,
      shop_longitude: addingNewShop ? shop.shop_latitude : -1,
    };

    console.log("Submitting:", payload);

    try {
      const response = await fetch("http://localhost:8000/c_add_product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        alert("Product added successfully!");
        navigate("/home");
      } else {
        alert(result.error || "Failed to add product.");
      }
      console.log("Response:", result);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the product.");
    }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      },
    });

    return shop.shop_latitude && shop.shop_longitude ? (
      <Marker position={[shop.shop_latitude, shop.shop_longitude]} />
    ) : null;
  }

  function MapViewUpdater() {
    const map = useMap();
    useEffect(() => {
      map.setView(mapCenter, 13); // Update map center and zoom level
    }, [map, mapCenter]);
    return null;
  }

  return (
    <div className="add-product-container">
      <Header view="products" setView={() => {}} />

      <div className="form-wrapper">
        <h2>Add New Product</h2>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h3>Shop Details</h3>
            <div className="row">
              {!addingNewShop && (
                <select
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="known-shops-dropdown"
                >
                  <option value="">Select a Shop</option>
                  {knownShops.map((shop) => (
                    <option key={shop.shop_id} value={shop.shop_id}>
                      {shop.shop_name} - {shop.shop_area}, {shop.shop_city}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => {
                  setAddingNewShop(!addingNewShop);
                  setSelectedShopId(null);
                }}
                className="add-new-shop-btn"
              >
                {addingNewShop ? "Select Existing Shop" : "Add New Shop"}
              </button>
            </div>

            {addingNewShop ? (
              <>
                <div className="row">
                  <input
                    type="text"
                    name="shop_city"
                    placeholder="Shop City"
                    value={shop.shop_city}
                    onChange={handleShopChange}
                  />
                  <input
                    type="text"
                    name="shop_area"
                    placeholder="Shop Area"
                    value={shop.shop_area}
                    onChange={handleShopChange}
                  />
                  <input
                    type="text"
                    name="shop_name"
                    placeholder="Shop Name"
                    value={shop.shop_name}
                    onChange={handleShopChange}
                  />
                </div>

                <div className="map-container">
                  <div>
                    <MapContainer
                      center={mapCenter}
                      zoom={13}
                      style={{ height: "300px", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker />
                      <MapViewUpdater />
                    </MapContainer>
                    <p>
                      Selected Location: Latitude: {shop.shop_latitude},
                      Longitude: {shop.shop_longitude}
                    </p>
                  </div>
                </div>

                <div className="row">
                  <select
                    name="shop_type"
                    value={shop.shop_type}
                    onChange={handleShopChange}
                    required
                  >
                    <option value="">Select Shop Type</option>
                    {[
                      "Grocery",
                      "Electronics",
                      "Clothing",
                      "Pharmacy",
                      "Other",
                      "Food",
                    ].map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="email"
                    name="shop_email"
                    placeholder="Shop Email"
                    value={shop.shop_email}
                    onChange={handleShopChange}
                    required
                  />
                </div>

                <div className="row">
                  <input
                    type="tel"
                    name="shop_phone_number"
                    placeholder="Shop Phone Number"
                    value={shop.shop_phone_number}
                    onChange={handleShopChange}
                    required
                  />
                </div>
                <div className="row">
                  <textarea
                    name="shop_description"
                    placeholder="Shop Description"
                    value={shop.shop_description}
                    onChange={handleShopChange}
                  />
                </div>
              </>
            ) : !addingNewShop && searchByID ? (
              <div className="row">
                <input
                  type="text"
                  name="shop_id"
                  placeholder="Shop ID"
                  value={shop.shop_id}
                  onChange={handleShopChange1}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchByID(false);
                  }}
                  className="add-new-shop-btn"
                >
                  Search By Shop Name
                </button>
              </div>
            ) : (
              // heyman
              <div className="row">
                <input
                  type="text"
                  name="shop_name"
                  placeholder="Shop Name"
                  value={suggestShops.shop_name}
                  onChange={handleShopChange1}
                />
                <input
                  type="text"
                  name="shop_area"
                  placeholder="Shop Area"
                  value={suggestShops.shop_area}
                  onChange={handleShopChange1}
                />
                <input
                  type="text"
                  name="shop_city"
                  placeholder="Shop City"
                  value={suggestShops.shop_city}
                  onChange={handleShopChange1}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchByID(true);
                  }}
                  className="add-new-shop-btn"
                >
                  Search by Shop ID
                </button>
              </div>
            )}
          </div>

          {true ? (
            <div className="form-section">
              <h3>Product Details</h3>
              <div className="row">
                <input
                  type="text"
                  name="product_name"
                  placeholder="Product Name"
                  value={product.product_name}
                  onChange={handleProductChange}
                  required
                />
                <input
                  type="number"
                  name="product_price"
                  placeholder="Price"
                  value={product.product_price}
                  onChange={handleProductChange}
                  required
                />
              </div>

              <div className="row">
                <select
                  name="product_category"
                  value={product.product_category}
                  onChange={handleProductChange}
                  required
                  className="category-dropdown"
                >
                  <option value="">Select Category</option>
                  {[
                    "Electronics",
                    "Clothing",
                    "Furniture",
                    "Books",
                    "Sports",
                    "Home & Kitchen",
                    "Beauty",
                    "Toys",
                    "Health",
                    "Food",
                    "Other",
                  ].map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="product_stock"
                  placeholder="Stock"
                  value={product.product_stock}
                  onChange={handleProductChange}
                />
              </div>

              <div className="row">
                <input
                  type="number"
                  name="product_rating"
                  placeholder="Rating"
                  value={product.product_rating}
                  onChange={handleProductChange}
                />
              </div>

              <div className="row">
                <textarea
                  name="product_description"
                  placeholder="Description"
                  value={product.product_description}
                  onChange={handleProductChange}
                />
              </div>
              <div className="row">
                <textarea
                  name="product_review"
                  placeholder="Review"
                  value={product.product_review}
                  onChange={handleProductChange}
                />
              </div>
              <div className="row">
                <input
                  type="file"
                  name="product_images"
                  accept="image/*"
                  onChange={handleProductChange}
                />
              </div>
            </div>
          ) : null}

          <button type="submit" disabled={!selectedShopId && !addingNewShop}>
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
