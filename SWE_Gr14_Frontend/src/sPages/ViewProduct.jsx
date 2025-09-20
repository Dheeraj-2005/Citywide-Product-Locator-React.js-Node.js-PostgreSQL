import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import '../sStyles/ViewProduct.scss';

function ViewProduct() {
    const navigate = useNavigate();

    // Simulate logged-in user
    const currentUserId = 'user123';

    const [product, setProduct] = useState({
        id: 'prod001',
        name: 'Wireless Headphones',
        price: '₹3,500',
        rating: '4.2',
        description: 'High-quality wireless headphones with noise cancellation.',
        stock: '30',
        likes: 10,
        dislikes: 2,
        creatorId: 'user123',
        images: null,
    });

    const [userReview, setUserReview] = useState('');
    const [userRating, setUserRating] = useState('');
    const [isReviewSubmitted, setIsReviewSubmitted] = useState(false); // Set to false to show review form initially
    const [isFlagged, setIsFlagged] = useState(false);
    const [flagReason, setFlagReason] = useState('');
    const [flagCount, setFlagCount] = useState(1); // Define flagCount state

    const [likes, setLikes] = useState(product.likes);
    const [dislikes, setDislikes] = useState(product.dislikes);

    const reviews = [
        {
            name: 'Aditi Sharma',
            rating: 4,
            comment: 'Good product, works well.',
            profilePic: '/user1.jpg',
        },
        {
            name: 'Ravi Verma',
            rating: 5,
            comment: 'Excellent sound quality!',
            profilePic: '/user2.jpg',
        }
    ];

    const handleFlagSubmit = () => {
        if (flagReason.trim()) {
            setIsFlagged(true);
            setFlagCount(flagCount + 1); // Increment the flag count
        }
    };

    const handleEditFlag = () => {
        setIsFlagged(false);
    };

    const handleDeleteFlag = () => {
        setFlagReason("");  // Clear the flag reason
        setIsFlagged(false);  // Reset flag submission state
        setFlagCount(flagCount - 1);  // Decrement the flag count
    };

    const handleReviewSubmit = () => {
        setIsReviewSubmitted(true); // Set to true once the review is submitted
    };

    const handleDeleteReview = () => {
        setUserReview('');
        setUserRating('');
        setIsReviewSubmitted(false); // Allow new review
    };

    const handleLike = () => {
        setLikes(likes + 1);
    };

    const handleDislike = () => {
        setDislikes(dislikes + 1);
    };

    const handleEditProduct = () => {
        navigate(`/edit-product/${product.id}`);
    };

    return (
        <>
            <Header />

            <div className="view-product-container">
                <div className="shop-details">
                    <div className="product-header">
                        <div className="product-header-left">
                            <h2>{product.name}</h2>
                            <div className="like-dislike-buttons">
                                <button className="like-btn" onClick={handleLike}>👍 {likes}</button>
                                <button className="dislike-btn" onClick={handleDislike}>👎 {dislikes}</button>
                            </div>
                        </div>
                        {currentUserId === product.creatorId && (
                            <div className="product-action">
                                <button className="edit-product-btn" onClick={handleEditProduct}>Edit Product</button>
                            </div>
                        )}
                    </div>

                    <p><strong>Price:</strong> {product.price}</p>
                    <p><strong>Rating:</strong> {product.rating} ⭐</p>
                    <p><strong>Description:</strong> {product.description}</p>
                    <p><strong>Stock:</strong> {product.stock}</p>
                    <p><strong>Likes:</strong> {likes}</p>
                    <p><strong>Dislikes:</strong> {dislikes}</p>

                    <div className="product-actions">
                        <button className="delete-btn">Delate</button>
                    </div>

                </div>

                <div className="reviews-section">
                    <h3>Reviews</h3>
                    {reviews.map((r, i) => (
                        <div key={i} className="review-card">
                            <img src={r.profilePic} alt={r.name} className="review-avatar" />
                            <div>
                                <strong>{r.name}</strong>
                                <p>{r.comment}</p>
                                <div className="user-rating">{r.rating} ⭐</div>
                            </div>
                        </div>
                    ))}


                </div>

                <div className="flag-section">
                    <h3>
                        Flags <span className="flag-count">({flagCount} Flags)</span>
                    </h3>
                    {reviews.map((r, i) => (
                        <div key={i} className="review-card">
                            <img src={r.profilePic} alt={r.name} className="review-avatar" />
                            <div>
                                <strong>{r.name}</strong>
                                <p>{r.comment}</p>
                                <div className="user-rating">{r.rating} ⭐</div>
                            </div>
                        </div>
                    ))}
                    {flagCount > 0 &&(
                        <div className="flag-form">
                            <textarea
                                placeholder="flag clarifiction"
                                value={flagReason}
                                onChange={(e) => setFlagReason(e.target.value)}
                            />
                            <button className="follow-shop-btn" onClick={handleFlagSubmit}>
                                submit 
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}

export default ViewProduct;
