// src/pages/AddedProducts.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import '../sStyles/AddedProducts.scss';

function AddedProducts() {
    const [view, setView] = useState('products');
    const navigate = useNavigate();

    const addedProducts = [
        {
            name: 'Laptop',
            price: '₹75,000',
            stock: '20',
            rating: '4.5',
            flags: 2
            
        },
        {
            name: 'Headphones',
            price: '₹3,500',
            stock: '50',
            rating: '4.2',
            flags: 0
        }
    ];

    return (
        <>
            <Header view={view} setView={setView} />

            <div className="review-container">
                <div className="top-bar">
                    <button className="add-product-btn" onClick={() => navigate('/sAddProduct')}>
                        Add Product
                    </button>
                </div>

                <div className="suggestions">
                    {view === 'products' &&
                        addedProducts.map((product, index) => (
                            <div key={index} className="suggestion-card">
                                <div className="product-top-row">
                                    <div>
                                        <strong>{product.name}</strong>
                                    </div>
                                    <button
                                        onClick={() =>
                                            navigate(`/shops/${product.shop.name.toLowerCase().replace(/\s+/g, '-')}`)
                                        }
                                        className="view-shop-btn"
                                    >
                                        View Product
                                    </button>
                                </div>

                                <div className="product-details">
                                    <div className="row-info">Price: {product.price}</div>
                                    <div className="row-info">
                                        Stock: {product.stock} | Rating: {product.rating} ⭐ | Flags: {product.flags}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
}

export default AddedProducts;
