import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../sStyles/ShopDetails.scss";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ShopDetails() {
    const navigate = useNavigate();
    const [shop, setShop] = useState({
        shop_name: "",
        shop_type: "",
        shop_email: "",
        shop_phone_number: "",
        shop_area: "",
        shop_city: "",
        shop_description: "",
        shop_rating: "",
        shop_images: null,
        shop_latitude: null,
        shop_longitude: null,
    });

    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India

    const handleShopChange = async (e) => {
        const { name, value } = e.target;
        setShop((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Update map center based on shop address or location
        if (name === "shop_area" || name === "shop_city") {
            const query = `${shop.shop_area || ""}, ${
                shop.shop_city || ""
            }, India`.trim();
            if (query) {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                            query
                        )}`
                    );
                    const data = await response.json();
                    if (data.length > 0) {
                        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
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
            return;
        }

        const payload = {
            user_id: userData.user_id,
            shop_name: shop.shop_name,
            shop_area: shop.shop_area,
            shop_city: shop.shop_city,
            shop_type: shop.shop_type,
            shop_email: shop.shop_email,
            shop_phone_number: shop.shop_phone_number,
            shop_images: [shop.shop_images?.name || ""],
            shop_description: shop.shop_description,
            shop_rating: shop.shop_rating,
            shop_latitude: shop.shop_latitude,
            shop_longitude: shop.shop_longitude,
        };

        if (payload.latitutde === null || payload.longitude === null) {
            alert("Please select a location on the map.");
            return;
        }

        console.log("Submitting:", payload);

        try {
            const response = await fetch("http://localhost:8000/shopDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log("Response:", result);
            if (result.success) {
                alert("Shop added successfully!");
                navigate("/shome");
            } else {
                alert(result.error || "Failed to add shop.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while adding the shop.");
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
        useState(() => {
            map.setView(mapCenter, 13); // Update map center and zoom level
        }, [map, mapCenter]);
        return null;
    }

    return (
        <div className="add-product-container">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-section">
                        <h3>Shop Details</h3>
                        <div className="row">
                            <input
                                type="text"
                                name="shop_name"
                                placeholder="Shop Name"
                                value={shop.shop_name}
                                onChange={handleShopChange}
                                required
                            />
                        </div>
                        <div className="row">
                            <input
                                type="text"
                                name="shop_type"
                                placeholder="Shop Type"
                                value={shop.shop_type}
                                onChange={handleShopChange}
                            />
                        </div>

                        <div className="row">
                            <input
                                type="email"
                                name="shop_email"
                                placeholder="Shop Email"
                                value={shop.shop_email}
                                onChange={handleShopChange}
                            />
                            <input
                                type="tel"
                                name="shop_phone_number"
                                placeholder="Shop Phone Number"
                                value={shop.shop_phone_number}
                                onChange={handleShopChange}
                            />
                        </div>

                        <div className="row">
                            <input
                                type="text"
                                name="shop_area"
                                placeholder="Shop Area"
                                value={shop.shop_area}
                                onChange={handleShopChange}
                            />
                            <input
                                type="text"
                                name="shop_city"
                                placeholder="Shop City"
                                value={shop.shop_city}
                                onChange={handleShopChange}
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

                        <div className="row">
                            <input
                                type="number"
                                name="shop_rating"
                                placeholder="Shop Rating (1-5)"
                                value={shop.shop_rating}
                                onChange={handleShopChange}
                                min="1"
                                max="5"
                            />
                        </div>

                        <div className="map-container">
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
                                Selected Location: Latitude: {shop.shop_latitude}, Longitude:{" "}
                                {shop.shop_longitude}
                            </p>
                        </div>

                        <div className="row">
                            <input
                                type="file"
                                name="shop_images"
                                accept="image/*"
                                onChange={(e) =>
                                    setShop((prev) => ({
                                        ...prev,
                                        shop_images: e.target.files[0],
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default ShopDetails;
