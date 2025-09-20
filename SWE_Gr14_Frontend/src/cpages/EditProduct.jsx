// src/cpages/EditProduct.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../cstyles/EditProduct.scss";

function EditProduct() {
    const navigate = useNavigate();
    const productId = localStorage.getItem("product_id"); // Get product_id from localStorage
    const user_id = JSON.parse(localStorage.getItem("user_data")).user_id;

    const [product, setProduct] = useState({
        product_name: "",
        product_price: "",
        product_rating: "",
        product_description: "",
        product_stock: "",
        product_review: "",
        product_images: null,
        product_category: "",
    });

    // List of product categories
    const categories = [
        'Electronics',
        'Clothing',
        'Furniture',
        'Books',
        'Sports',
        'Home & Kitchen',
        'Beauty',
        'Toys',
        'Health',
        'Food',
        'Other'
    ];

    const [shop, setShop] = useState({
        shop_name: "",
        shop_rating: "",
        shop_type: "",
        shop_email: "",
        shop_phone_number: "",
        shop_address: "",
        shop_google_map_link: "",
        shop_review: "",
        shop_images: null,
    });

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetch("http://localhost:8000/c_get_product_details", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ product_id: productId }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch product details");
                }

                const data = await response.json();
                console.log("Fetched product details:", data);

                if (data.success) {
                    const productDetails = data.product_details;
                    setProduct({
                        product_name: productDetails.product_name,
                        product_price: productDetails.product_price,
                        product_rating: productDetails.product_rating,
                        product_description: productDetails.product_description,
                        product_stock: productDetails.product_stock,
                        product_review: productDetails.product_review,
                        product_images: null, // Images will be uploaded separately
                        product_category: productDetails.product_category,
                    });
                    setShop({
                        shop_name: productDetails.shop_name,
                        shop_rating: productDetails.shop_rating,
                        shop_type: productDetails.shop_type,
                        shop_email: productDetails.shop_email,
                        shop_phone_number: productDetails.shop_phone_number,
                        shop_address: productDetails.shop_address,
                        shop_google_map_link: productDetails.shop_google_map_link,
                        shop_review: productDetails.shop_review,
                        shop_images: null, // Shop images will be uploaded separately
                    });
                } else {
                    alert(data.error || "Failed to fetch product details.");
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
                alert("An error occurred while fetching product details.");
            }
        };

        fetchProductDetails();
    }, [productId]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name in product) {
            setProduct((prev) => ({
                ...prev,
                [name]: files ? files[0] : value,
            }));
        } else if (name in shop) {
            setShop((prev) => ({
                ...prev,
                [name]: files ? files[0] : value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            user_id: user_id,
            product_id: productId,
            ...product,
            ...shop,
            product_images: product.product_images ? [product.product_images.name] : [],
            shop_images: shop.shop_images ? [shop.shop_images.name] : []
        };

        try {
            console.log("Payload before submission:", payload);
            const response = await fetch("http://localhost:8000/c_edit_product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to edit product");
            }

            const data = await response.json();
            if (data.success) {
                alert("Product updated successfully!");
                navigate("/AddedProducts");
            } else {
                alert(data.error || "Failed to update product.");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            alert("An error occurred while updating the product.");
        }
    };

    return (
        <>
            <Header view="products" setView={() => {}} />
            <div className="review-container">
                <div className="suggestion-card">
                    <form onSubmit={handleSubmit} className="edit-form">
                        <h3>Product Details</h3>
                        <div className="row">
                            <input
                                type="text"
                                name="product_name"
                                value={product.product_name}
                                onChange={handleChange}
                                placeholder="Product Name"
                            />
                            <input
                                type="text"
                                name="product_price"
                                value={product.product_price}
                                onChange={handleChange}
                                placeholder="Price"
                            />
                        </div>
                        <div className="row">
                            <input
                                type="text"
                                name="product_rating"
                                value={product.product_rating}
                                onChange={handleChange}
                                placeholder="Rating"
                            />
                            <input
                                type="text"
                                name="product_stock"
                                value={product.product_stock}
                                onChange={handleChange}
                                placeholder="Stock"
                            />
                        </div>
                        <div className="row">
                            <input
                                type="text"
                                name="product_description"
                                value={product.product_description}
                                onChange={handleChange}
                                placeholder="Description"
                            />
                            {/* <input
                                type="text"
                                name="product_category"
                                value={product.product_category}
                                onChange={handleChange}
                                placeholder="Category"
                            /> */}
                            <select 
                                name="product_category" 
                                value={product.product_category} 
                                onChange={handleChange} 
                                required
                                className="category-dropdown"
                            >
                                <option value="">Select Category</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                            </select>                            
                        </div>
                        <div className="row">
                            <input
                                type="text"
                                name="product_review"
                                value={product.product_review}
                                onChange={handleChange}
                                placeholder="Reviews"
                            />
                            <input type="file" name="product_images" onChange={handleChange} />
                        </div>

                        <h3>Shop Details</h3>
                        <div className="row">
                            <input
                                type="text"
                                name="shop_name"
                                value={shop.shop_name}
                                onChange={handleChange}
                                placeholder="Shop Name"
                            />
                            <input
                                type="text"
                                name="shop_rating"
                                value={shop.shop_rating}
                                onChange={handleChange}
                                placeholder="Shop Rating"
                            />
                        </div>
                        <div className="row">
                            <input
                                type="text"
                                name="shop_type"
                                value={shop.shop_type}
                                onChange={handleChange}
                                placeholder="Shop Type"
                            />
                            <input
                                type="email"
                                name="shop_email"
                                value={shop.shop_email}
                                onChange={handleChange}
                                placeholder="Shop Email"
                            />
                        </div>
                        <div className="row">
                            <input
                                type="text"
                                name="shop_phone_number"
                                value={shop.shop_phone_number}
                                onChange={handleChange}
                                placeholder="Shop Phone Number"
                            />
                            <input
                                type="text"
                                name="shop_address"
                                value={shop.shop_address}
                                onChange={handleChange}
                                placeholder="Shop Address"
                            />
                        </div>
                        <div className="row">
                            <input
                                type="text"
                                name="shop_google_map_link"
                                value={shop.shop_google_map_link}
                                onChange={handleChange}
                                placeholder="Google Map Link"
                            />
                            <input
                                type="text"
                                name="shop_review"
                                value={shop.shop_review}
                                onChange={handleChange}
                                placeholder="Reviews"
                            />
                        </div>
                        <div className="row">
                            <input type="file" name="shop_images" onChange={handleChange} />
                        </div>

                        <button type="submit" className="add-product-btn">
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditProduct;
