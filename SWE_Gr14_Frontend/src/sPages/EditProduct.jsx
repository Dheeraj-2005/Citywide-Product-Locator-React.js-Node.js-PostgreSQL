// src/pages/EditProduct.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import '../sStyles/EditProduct.scss';

function EditProduct() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [editMode, setEditMode] = useState(false);

    const [product, setProduct] = useState({
        name: 'MacBook Pro',
        price: '₹1,50,000',
        rating: '4.8',
        description: 'A high-performance laptop by Apple.',
        stock: '12',
        images: null, // Replace with File if testing upload
    });

    const [shop, setShop] = useState({
        shopName: 'Apple Store',
        shopRating: '4.9',
        shopType: 'Electronics',
        shopEmail: 'store@apple.com',
        shopPhoneNumber: '+91-9876543210',
        shopAddress: '1 Infinite Loop, Cupertino, CA',
        shopLocation: 'California, USA',
        shopPic: null, // Replace with File if testing upload
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name in product) {
            setProduct(prev => ({
                ...prev,
                [name]: files ? files[0] : value
            }));
        } else if (name in shop) {
            setShop(prev => ({
                ...prev,
                [name]: files ? files[0] : value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setEditMode(false);

        const formData = new FormData();
        Object.entries(product).forEach(([key, value]) => {
            formData.append(key, value);
        });
        Object.entries(shop).forEach(([key, value]) => {
            formData.append(key, value);
        });

        console.log('Product data:', product);
        console.log('Shop data:', shop);

        alert('Dummy values submitted!');
    };

    return (
        <>
            <Header view="products" setView={() => { }} />
            <div className="review-container">
                <div className="suggestion-card">
                    <form onSubmit={handleSubmit} className="edit-form">
                        <h3>Product Details</h3>
                        <div className="row">
                            <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" />
                            <input type="text" name="price" value={product.price} onChange={handleChange} placeholder="Price" />
                        </div>
                        <div className="row">
                            <input type="text" name="rating" value={product.rating} onChange={handleChange} placeholder="Rating" />
                            <input type="text" name="stock" value={product.stock} onChange={handleChange} placeholder="Stock" />
                        </div>
                        <div className="row">
                            <input type="text" name="description" value={product.description} onChange={handleChange} placeholder="Description" />
                            <input type="file" name="images" onChange={handleChange} />
                        </div>
                        <button type="submit" className="add-product-btn">Save Changes</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditProduct;
