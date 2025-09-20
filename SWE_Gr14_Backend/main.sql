CREATE DATABASE swe_db;

\c swe_db;

CREATE TABLE c_users (
    user_id VARCHAR(10),
    email VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL
);

CREATE TABLE c_user_otp (
    user_id VARCHAR(10),
    email VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL
);

CREATE TABLE s_users (
    user_id VARCHAR(10),
    email VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL
);

CREATE TABLE s_user_otp (
    user_id VARCHAR(10),
    email VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL
);

CREATE TABLE c_profiles (
    user_id VARCHAR(10),
    email VARCHAR(255),
    -- email VARCHAR(255) PRIMARY KEY,
    age INT NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    gender VARCHAR(1) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    pic TEXT
);

CREATE TABLE s_profiles (
    user_id VARCHAR(10),
    email VARCHAR(255),
    -- email VARCHAR(255) PRIMARY KEY,
    age INT NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    pic TEXT
);



-- --------------------------

CREATE TABLE c_shops (
    user_id VARCHAR(10),
    shop_id VARCHAR(4),
    shop_name VARCHAR(255) NOT NULL,
    shop_type VARCHAR(255) NOT NULL,
    shop_area VARCHAR(255) NOT NULL,
    shop_city VARCHAR(255) NOT NULL,
    shop_email VARCHAR(255) NOT NULL,
    shop_phone_number VARCHAR(255) NOT NULL,
    shop_images TEXT[],
    shop_description TEXT,
    shop_rating INT,
    shop_owned BOOLEAN DEFAULT FALSE,
    shop_latitude FLOAT,
    shop_longitude FLOAT
);

CREATE TABLE shops (
    user_id VARCHAR(10),
    shop_id VARCHAR(4),
    shop_name VARCHAR(255) NOT NULL,
    shop_type VARCHAR(255) NOT NULL,
    shop_area VARCHAR(255) NOT NULL,
    shop_city VARCHAR(255) NOT NULL,
    shop_email VARCHAR(255) NOT NULL,
    shop_phone_number VARCHAR(255) NOT NULL,
    shop_images TEXT[],
    shop_description TEXT,
    shop_rating INT,
    shop_owned BOOLEAN DEFAULT FALSE,
    shop_latitude FLOAT,
    shop_longitude FLOAT    
);

CREATE TABLE c_products (
    user_id VARCHAR(10),
    shop_id VARCHAR(4),
    product_id VARCHAR(4) PRIMARY KEY,
    product_name TEXT NOT NULL,
    product_price TEXT NOT NULL,
    product_rating INT,
    product_description TEXT,
    product_review TEXT,
    product_stock TEXT NOT NULL,
    product_images TEXT[],
    product_category TEXT NOT NULL
);

CREATE TABLE c_wishlists (
    wishlist_id SERIAL PRIMARY KEY,
    user_id VARCHAR(10) NOT NULL,
    product_id VARCHAR(10) NOT NULL,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES c_products(product_id)
);


CREATE TABLE c_reviews (
    review_id SERIAL PRIMARY KEY,
    user_id VARCHAR(10) NOT NULL,
    product_id VARCHAR(4) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES c_products(product_id)
);

CREATE TABLE c_flags (
    user_id VARCHAR(10) NOT NULL,
    product_id VARCHAR(4) NOT NULL,
    flag_reason TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE notifications (
    user_id VARCHAR(10) NOT NULL,
    notification_id SERIAL PRIMARY KEY,
    notification_type VARCHAR(50) NOT NULL,
    notification_message TEXT NOT NULL,
    notification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE c_product_follows (
    user_id VARCHAR(10) NOT NULL,
    product_id VARCHAR(4) NOT NULL
);

