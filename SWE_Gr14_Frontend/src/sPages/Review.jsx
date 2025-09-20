import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import '../sStyles/Review.scss';

function Review() {
    const [view, setView] = useState('products');
    const navigate = useNavigate();

    const productSuggestions = [
        {
            name: 'Laptop',
            price: '₹75,000',
            stock: '20',
            rating: '4.5',
            flags: 2,
            review: 'Very reliable and fast performance.',
            reviewRating: 4.7,
            user: {
                first_name: 'John'
            }
        },
        {
            name: 'Headphones',
            price: '₹3,500',
            stock: '50',
            rating: '4.2',
            flags: 0,
            review: 'Great sound quality and comfort.',
            reviewRating: 4.3,
            user: {
                first_name: 'Jane'
            }
        }
    ];

    const shopSuggestions = [
        {
            name: 'Electronics Hub',
            review: 'Excellent variety and helpful staff.',
            reviewRating: 4.8,
            user: {
                first_name: 'Alice'
            }
        },
        {
            name: 'Fashion World',
            review: 'Trendy collection with good prices.',
            reviewRating: 4.2,
            user: {
                first_name: 'Bob'
            }
        },
        {
            name: 'Book Stop',
            review: 'Wide selection and peaceful ambiance.',
            reviewRating: 4.9,
            user: {
                first_name: 'Charlie'
            }
        }
    ];

    return (
        <>
            <Header view={view} setView={setView} />

            <div className="review-container">
                {/* View Toggle */}
                <div className="view-toggle">
                    <button
                        className={view === 'products' ? 'active' : ''}
                        onClick={() => setView('products')}
                    >
                        Products
                    </button>
                    <button
                        className={view === 'shops' ? 'active' : ''}
                        onClick={() => setView('shops')}
                    >
                        Shops
                    </button>
                </div>

                <div className="suggestions">
                    {view === 'products' &&
                        productSuggestions.map((product, index) => (
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

                                <div className="card-bottom">
                                    <div className="submitted-review">
                                        <div><strong>Rating:</strong> {product.reviewRating} ⭐</div>
                                        <div><strong>Review:</strong> {product.review}</div>
                                        <div><strong>Review by:</strong> {product.user.first_name}</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    {view === 'shops' &&
                        shopSuggestions.map((shop, index) => (
                            <div key={index} className="suggestion-card">
                                <div className="card-bottom">
                                    <div className="submitted-review1">
                                        <div><strong>Review:</strong> {shop.review}</div>
                                        <div><strong>Rating:</strong> {shop.reviewRating} ⭐</div>
                                        <div><strong>Review by:</strong> {shop.user.first_name}</div>
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
