import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import '../sStyles/AddProduct.scss';

function AddProduct() {
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        name: '',
        price: '',
        description: '',
        stock: '',
        images: null,
    });


    const handleProductChange = (e) => {
        const { name, value, files } = e.target;
        setProduct((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleShopChange = (e) => {
        const { name, value, files } = e.target;
        setShop((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!shop.shopAddress && !shop.shopLocation) {
            alert('Either address or Google Maps location link is required.');
            return;
        }

        const formData = {
            ...product,
            images: product.images ? product.images.name : '',
            ...shop,
            shopPic: shop.shopPic ? shop.shopPic.name : '',
        };

        console.log('Submitting:', formData);
        navigate('/');
    };

    return (
        <div className="add-product-container">
            <Header view="products" setView={() => { }} />

            <div className="form-wrapper">
                <h2>Add New Product</h2>

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-section">
                        <h3>Product Details</h3>

                        <div className="row">
                            <input type="text" name="name" placeholder="Product Name" value={product.name} onChange={handleProductChange} required />
                            <input type="number" name="price" placeholder="Price" value={product.price} onChange={handleProductChange} required />
                        </div>

                        <div className="row">
                            <input type="number" name="stock" placeholder="Stock" value={product.stock} onChange={handleProductChange} />
                        </div>

                        <div className="row">
                            <textarea name="description" placeholder="Description" value={product.description} onChange={handleProductChange} />
                        </div>
        
                        <div className="row">
                            <input type="file" name="images" accept="image/*" onChange={handleProductChange} />
                        </div>
                    </div>

                    <button type="submit">Add Product</button>
                </form>
            </div>
        </div>
    );
}

export default AddProduct;
