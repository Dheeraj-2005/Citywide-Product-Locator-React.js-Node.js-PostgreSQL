from models import models
from dotenv import load_dotenv
from . import database
import bcrypt
import os
import random
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import hashlib
load_dotenv()
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64
import time
import os
import re

load_dotenv()
def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email) is not None

async def register_user(person: models.C_RegisterRequest):
    """
    Take email and password
    Generate the hash of the password
    Generate the OTP
    Send the OTP to the email
    Save the email, hashed_password and OTP in the user_otp table
    """
    # Generate the hash of the password
    hashed_password = bcrypt.hashpw(person.password.encode('utf-8'), bcrypt.gensalt())
    # Generate the OTP
    otp = random.randint(100000, 999999)
    
    # SMTP configuration
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    smtp_user = "sweprojectgr14@gmail.com"
    smtp_password = "ztrexujzddttjbak"
    if not is_valid_email(person.email):
        print({"error": f"Invalid recipient email address: {person.email}"})
        return {"error": "Invalid email address."}
    # Create the email content
    message = MIMEMultipart()
    message["From"] = smtp_user
    message["To"] = person.email
    message["Subject"] = "Product Locator Registration | Your OTP Code"
    body = f"Your OTP is: {otp}"
    message.attach(MIMEText(body, "plain"))

    # Send the email
    
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
            print(f"Email sent to {person.email}")
    except Exception as e:
        return {"error": f"Failed to send email : {person.email} {e}"}
    
    # Generate a unique user_id
    user_id = str(random.randint(100000, 999999))
    # Check if the user_id already exists
    try:
        connection, cursor = database.make_db()
        cursor.execute("SELECT 1 FROM c_users WHERE user_id = %s", (user_id,))
        if cursor.fetchone():
            return {"error": "User ID already exists. Please try again."}
    except Exception as e:
        return {"error": f"Database error: {e}"}
    
    # Save the email, hashed_password, and OTP in the user_otp table
    try:
        connection, cursor = database.make_db()
        insert_query = """
            INSERT INTO c_user_otp (user_id, email, hashed_password, otp_code)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            user_id,
            person.email,
            hashed_password.decode('utf-8'),
            otp
        ))
        connection.commit()
        cursor.close()
        connection.close()
        return {
            "success": True,
            "message": "OTP sent to your email. Please verify to complete registration.",
            "user_id": user_id,
            "otp": otp
        }
    except Exception as e:
        return {
            "error": f"Failed to save user data: {e}",
        }
        
async def verify_otp(person: models.C_OTPVerification):
    """
    Get the email and otp
    Fetch email, hashed_password and OTP from the user_otp table
    Compare the OTP and email with the one in the database
    If they match, delete the OTP from the user_otp table
    Add it to the users table
    """

    # Step 1: Connect to DB
    try:
        conn, cursor = database.make_db()

        # Step 2: Fetch the entry
        cursor.execute(
            "SELECT user_id, email, hashed_password, otp_code FROM c_user_otp WHERE user_id = %s",
            (person.user_id,)
        )
        result = cursor.fetchall()

        if not result:
            return {"error": "Email not found or OTP expired."}

        db_user_id, db_email, db_hashed_password, db_otp = result[0]

        # Step 3: Compare OTP
        if str(db_otp) != str(person.otp):
            return {"error": "Invalid OTP."}
        

        # Step 4: Insert into users table
        cursor.execute(
            "INSERT INTO c_users (user_id, email, hashed_password) VALUES (%s, %s, %s)",
            (db_user_id, db_email, db_hashed_password,)
        )

        # Step 5: Delete from user_otp table
        cursor.execute("DELETE FROM c_user_otp WHERE user_id = %s", (db_user_id,))

        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "User verified and registered successfully."}

    except Exception as e:
        return {"success": False, "message": f"An error occurred: {str(e)}"}
    
async def login_user(person: models.C_LoginRequest):
    """
    Get the email and password
    Fetch the hashed password from the users table
    Compare with the input password
    If same then generate a token using the following algorithm:
    String concatenate the current time + email
    Hash this string and return it
    """
    try:
        conn, cursor = database.make_db()

        # Fetch stored hashed password
        cursor.execute("SELECT user_id, email, hashed_password FROM c_users WHERE email = %s", (person.email,))
        result = cursor.fetchone()

        if not result:
            return {"error": "Invalid email or password."}

        user_id = result[0]
        email = result[1]
        stored_hashed_password = result[2]
        
        # Verify password
        if not bcrypt.checkpw(person.password.encode('utf-8'), stored_hashed_password.encode('utf-8')):
            return {"error": "Invalid email or password."}

        cursor.close()
        conn.close()

        return {"success": True, "user_id": user_id, "email": email}

    except Exception as e:
        return {"error": f"Login failed: {str(e)}"}
    
async def edit_profile(data: models.C_EditProduct):
    """
    Check if the token is valid
    If valid, insert the profile data into the profile table
    """
    try:
        # fetch the email from the token
        conn, cursor = database.make_db()
        query = """
            SELECT email FROM c_users
            WHERE user_id = %s
        """
        cursor.execute(query, (data.user_id,))
        result = cursor.fetchone()
        if not result:
            return {"error": "User not found."}
        email = result[0]
                

        # Insert profile data
        # first delete if an entry exists
        cursor.execute("DELETE FROM c_profiles WHERE user_id = %s", (data.user_id,))
        
        # then insert the new entry
        insert_query = """
            INSERT INTO c_profiles (
                user_id,
                email,
                first_name,
                last_name,
                age,
                gender,
                phone_number,
                pic
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            data.user_id,
            email,
            data.first_name,
            data.last_name,
            data.age,
            data.gender,
            data.phone_number,
            data.pic
        ))
        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "Profile created successfully."}

    except Exception as e:
        return {"error": f"Failed to create profile: {str(e)}"}
    
async def add_shop(data: models.C_NewShop):
    """
    Check if the token is valid
    If valid, insert the shop data into the shop table
    """
    try:
        # Decode AES key and IV from environment
        key = base64.b64decode(os.getenv("SESSION_KEY"))  # 32 bytes
        iv = base64.b64decode(os.getenv("SESSION_IV"))    # 16 bytes

        # Decode and decrypt token
        encrypted_token = base64.b64decode(data.session_id)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted_data = unpad(cipher.decrypt(encrypted_token), AES.block_size)
        decrypted_str = decrypted_data.decode("utf-8")

        # Extract email (assumes format: "<timestamp><email>")
        email = ''.join(filter(lambda c: not c.isdigit() and c != '.', decrypted_str))

        # Insert shop data
        conn, cursor = database.make_db()
        insert_query = """
            INSERT INTO shops (
            email,
            shop_name,
            shop_type,
            shop_location,
            shop_email,
            shop_phone_number,
            shop_pic
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            email,
            data.shop_name,
            data.shop_type,
            data.shop_location,
            data.shop_email,
            data.shop_phone_number,
            data.shop_pic
        ))
        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "Shop added successfully."}

    except Exception as e:
        return {"error": f"Failed to add shop: {str(e)}"}
    
async def get_profile(data: models.C_GetProfile):
    """
    Decrypt the session token
    Extract the email
    Retrieve the profile from the profiles table using the email
    """
    try:

        # Fetch profile data
        conn, cursor = database.make_db()
        query = """
            SELECT user_id, email, first_name, last_name, age, gender, phone_number, pic
            FROM c_profiles
            WHERE user_id = %s
        """
        cursor.execute(query, (data.user_id,))
        result = cursor.fetchone()

        cursor.close()
        conn.close()

        if not result:
            return {"error": "Profile not found."}

        profile_data = {
            "user_id": result[0],
            "email": result[1],
            "first_name": result[2],
            "last_name": result[3],
            "age": result[4],
            "gender": result[5],
            "phone_number": result[6],
            "pic": result[7],
        }

        return {"success": True, "profile": profile_data}

    except Exception as e:
        return {"error": f"Failed to get profile: {str(e)}"}
    
async def s_get_profile(data: models.C_GetProfile):
    """
    Decrypt the session token
    Extract the email
    Retrieve the profile from the profiles table using the email
    """
    try:

        # Fetch profile data
        conn, cursor = database.make_db()
        query = """
            SELECT user_id, email, first_name, last_name, age, gender, phone_number, pic
            FROM s_profiles
            WHERE user_id = %s
        """
        cursor.execute(query, (data.user_id,))
        result = cursor.fetchone()

        cursor.close()
        conn.close()

        if not result:
            return {"error": "Profile not found."}

        profile_data = {
            "user_id": result[0],
            "email": result[1],
            "first_name": result[2],
            "last_name": result[3],
            "age": result[4],
            "gender": result[5],
            "phone_number": result[6],
            "pic": result[7],
        }

        return {"success": True, "profile": profile_data}

    except Exception as e:
        return {"error": f"Failed to get profile: {str(e)}"}

async def add_product(data: models.C_Product):
    """
    Add a new product to the database. If a shop doesn't exist (no shop_id), insert the shop first.
    """
    try:
        conn, cursor = database.make_db()

        # If shop_id is not provided, generate one and insert new shop
        shop_id = data.shop_id
        if  shop_id == "":
            while True:
                shop_id = str(random.randint(1000, 9999))
                cursor.execute("SELECT 1 FROM c_shops WHERE shop_id = %s", (shop_id,))
                if not cursor.fetchone():
                    break

            insert_shop_query = """
                INSERT INTO c_shops (
                    user_id,
                    shop_id,
                    shop_name,
                    shop_type,
                    shop_area,
                    shop_city,
                    shop_email,
                    shop_phone_number,
                    shop_images,
                    shop_description,
                    shop_rating,
                    shop_owned,
                    shop_latitude,
                    shop_longitude
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """

            cursor.execute(insert_shop_query, (
                data.user_id,
                shop_id,
                data.shop_name,
                data.shop_type,
                data.shop_area,
                data.shop_city,
                data.shop_email,
                data.shop_phone_number,
                data.shop_images,
                data.shop_description,
                data.shop_rating,
                "TRUE" if data.shop_id != "" else "FALSE",
                data.shop_latitude,
                data.shop_longitude
            ))

        # Generate unique product_id
        while True:
            product_id = str(random.randint(1000, 9999))
            cursor.execute("SELECT * FROM c_products WHERE product_id = %s", (product_id,))
            if not cursor.fetchone():
                break

        insert_product_query = """
            INSERT INTO c_products (
                user_id,
                shop_id,
                product_id,
                product_name,
                product_price,
                product_rating,
                product_description,
                product_review,
                product_stock,
                product_images,
                product_category
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(insert_product_query, (
            data.user_id,
            shop_id,
            product_id,
            data.product_name,
            data.product_price,
            data.product_rating,
            data.product_description,
            data.product_review,
            data.product_stock,
            data.product_images,
            data.product_category
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "Product added successfully.", "product_id": product_id}

    except Exception as e:
        return {"error": f"Failed to add product: {str(e)}"}

    
async def get_product(search_term: str):
    """
    Search for products based on search term and optional category filter.
    Returns a list of matching products along with shop details.
    """
    try:
        conn, cursor = database.make_db()
        
        # Updated query to join c_products and c_shops
        query = """
            SELECT 
                p.product_id, 
                p.user_id, 
                p.product_name, 
                p.product_price, 
                p.product_rating, 
                p.product_description, 
                p.product_stock, 
                p.product_images, 
                p.product_category,
                s.shop_name, 
                s.shop_rating, 
                CONCAT(s.shop_area, ', ', s.shop_city) AS shop_location
            FROM 
                c_products p
            JOIN 
                c_shops s ON p.shop_id = s.shop_id
            WHERE 
                LOWER(p.product_name) LIKE LOWER(%s) 
                OR LOWER(p.product_description) LIKE LOWER(%s)
        """
        params = [f'%{search_term}%', f'%{search_term}%']
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        if not results:
            return {"success": True, "products": []}
        
        # Format the results into a list of dictionaries
        products = []
        for result in results:
            product = {
                "product_id": result[0],
                "user_id": result[1],
                "product_name": result[2],
                "product_price": float(result[3]),  # Convert price to float
                "product_rating": result[4],
                "product_description": result[5],
                "product_stock": result[6],
                "product_images": result[7],
                "product_category": result[8],
                "shop_name": result[9],
                "shop_rating": result[10],
                "shop_location": result[11]
            }
            products.append(product)
        
        return {"success": True, "products": products}
        
    except Exception as e:
        return {"error": f"Failed to search products: {str(e)}"}
    
# async def get_shops(data: models.C_GetShops):
#     """
#     Retrieve all shops from the database
#     """
#     try:
#         # Connect to the database
#         conn, cursor = database.make_db()
        
#         # Fetch all shops
#         query = """
#             SELECT shop_id, email, shop_name, shop_type, shop_location, shop_email, shop_phone_number, shop_pic
#             FROM shops
#         """
#         cursor.execute(query)
#         results = cursor.fetchall()
        
#         cursor.close()
#         conn.close()
        
#         if not results:
#             return {"success": True, "shops": []}
        
#         # Format the results into a list of dictionaries
#         shops = []
#         for result in results:
#             shop = {
#                 "shop_id": result[0],
#                 "email": result[1],
#                 "shop_name": result[2],
#                 "shop_type": result[3],
#                 "shop_location": result[4],
#                 "shop_email": result[5],
#                 "shop_phone_number": result[6],
#                 "shop_pic": result[7]
#             }
#             shops.append(shop)
        
#         return {"success": True, "shops": shops}
        
#     except Exception as e:
#         return {"error": f"Failed to retrieve shops: {str(e)}"}


async def add_to_wishlist(data: models.C_WishlistItem):
    """
    Add a product to the user's wishlist.
    If the product already exists in the wishlist, it won't be added again.
    """
    try:
        conn, cursor = database.make_db()
        
        # Check if the item is already in the wishlist
        check_query = """
            SELECT 1 FROM c_wishlists WHERE user_id = %s AND product_id = %s
        """
        cursor.execute(check_query, (data.user_id, data.product_id))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return {"success": True, "message": "Product is already in your wishlist."}
        
        # Add to wishlist
        insert_query = """
            INSERT INTO c_wishlists (user_id, product_id)
            VALUES (%s, %s)
        """
        cursor.execute(insert_query, (data.user_id, data.product_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": True, "message": "Product added to wishlist successfully."}
        
    except Exception as e:
        return {"error": f"Failed to add to wishlist: {str(e)}"}

    
async def get_product_details(data: models.C_Product):
    """
    Get product details by product_id, including shop details.
    """
    try:
        conn, cursor = database.make_db()
        
        # Fetch product details
        query = """
            SELECT 
            p.product_id, p.user_id, p.product_name, p.product_price, p.product_rating, 
            p.product_description, p.product_review, p.product_stock, p.product_images, 
            p.product_category,
            s.shop_name, s.shop_rating, s.shop_type, s.shop_email, s.shop_phone_number, 
            s.shop_area, s.shop_review, s.shop_images, s.shop_latitude, s.shop_longitude
            FROM c_products p 
            LEFT JOIN c_shops s ON p.shop_id = s.shop_id WHERE product_id = %s
        """
        cursor.execute(query, (data.product_id,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not result:
            return {"error": "Product not found."}
        
        product_details = {
            "product_id": result[0],
            "user_id": result[1],
            "product_name": result[2],
            "product_price": float(result[3]),
            "product_rating": result[4],
            "product_description": result[5],
            "product_review": result[6],
            "product_stock": result[7],
            "product_images": result[8],
            "product_category": result[9],
            "shop_name": result[10],
            "shop_rating": result[11],
            "shop_type": result[12],
            "shop_email": result[13],
            "shop_phone_number": result[14],
            "shop_area": result[15],
            "shop_review": result[16],
            "shop_images": result[17],
            "shop_latitude": float(result[18]) if result[18] else None,
            "shop_longitude": float(result[19]) if result[19] else None,
        }
        
        return {"success": True, "product_details": product_details}
        
    except Exception as e:
        return {"error": f"Failed to get product details: {str(e)}"}
    
    
async def edit_product(data: models.C_EditProduct):
    """
    Edit an existing product in the database.
    Validates that the user_id matches the owner of the product before allowing edits.
    """
    try:
        conn, cursor = database.make_db()
        
        # First check if the product exists and belongs to the user
        check_query = """
            SELECT user_id FROM c_products WHERE product_id = %s
        """
        cursor.execute(check_query, (data.product_id,))
        result = cursor.fetchone()
        
        if not result:
            cursor.close()
            conn.close()
            return {"error": "Product not found."}
            
        owner_id = result[0]
        if owner_id != data.user_id:
            cursor.close()
            conn.close()
            return {"error": "You do not have permission to edit this product."}
        
        # Update the product
        update_query = """
            UPDATE c_products SET
                product_name = %s,
                product_price = %s,
                product_rating = %s,
                product_description = %s,
                product_review = %s,
                product_stock = %s,
                product_images = %s,
                product_category = %s,
                shop_name = %s,
                shop_rating = %s,
                shop_type = %s,
                shop_email = %s,
                shop_phone_number = %s,
                shop_address = %s,
                shop_google_map_link = %s,
                shop_review = %s,
                shop_images = %s
            WHERE product_id = %s
        """
        
        cursor.execute(update_query, (
            data.product_name,
            data.product_price,
            data.product_rating,
            data.product_description,
            data.product_review,
            data.product_stock,
            data.product_images,
            data.product_category,
            data.shop_name,
            data.shop_rating,
            data.shop_type,
            data.shop_email,
            data.shop_phone_number,
            data.shop_address,
            data.shop_google_map_link,
            data.shop_review,
            data.shop_images,
            data.product_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": True, "message": "Product updated successfully."}
        
    except Exception as e:
        return {"error": f"Failed to update product: {str(e)}"}
    
    
async def add_review(data: models.C_AddReview):
    """
    Add a review for a product.
    Validates that the product exists before adding the review.
    """
    try:
        conn, cursor = database.make_db()
        
        # First check if the product exists
        check_query = """
            SELECT 1 FROM c_products WHERE product_id = %s
        """
        cursor.execute(check_query, (data.product_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return {"error": "Product not found."}
        
        # Add the review
        insert_query = """
            INSERT INTO c_reviews (user_id, product_id, rating, review_text)
            VALUES (%s, %s, %s, %s)
            RETURNING review_id
        """
        cursor.execute(insert_query, (
            data.user_id,
            data.product_id,
            data.rating,
            data.review_text
        ))
        
        review_id = cursor.fetchone()[0]
        
        # Update the average rating for the product
        update_rating_query = """
            UPDATE c_products 
            SET product_rating = (
                SELECT ROUND(AVG(rating)) 
                FROM c_reviews 
                WHERE product_id = %s
            )
            WHERE product_id = %s
        """
        cursor.execute(update_rating_query, (data.product_id, data.product_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": True, "message": "Review added successfully.", "review_id": review_id}
        
    except Exception as e:
        return {"error": f"Failed to add review: {str(e)}"}

async def get_reviews(data: models.C_GetReviews):
    """
    Get all reviews for a product.
    Includes user information (email and profile picture) for each review.
    """
    try:
        conn, cursor = database.make_db()
        
        # Join reviews with users and profiles to get user info
        query = """
            SELECT 
                r.review_id,
                r.user_id,
                r.rating,
                r.review_text,
                r.date_added,
                u.email,
                p.first_name,
                p.last_name,
                p.pic
            FROM 
                c_reviews r
            JOIN 
                c_users u ON r.user_id = u.user_id
            LEFT JOIN 
                c_profiles p ON r.user_id = p.user_id
            WHERE 
                r.product_id = %s
            ORDER BY 
                r.date_added DESC
        """
        cursor.execute(query, (data.product_id,))
        results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        if not results:
            return {"success": True, "reviews": []}
        
        # Format the results
        reviews = []
        for result in results:
            review = {
                "review_id": result[0],
                "user_id": result[1],
                "rating": result[2],
                "review_text": result[3],
                "date_added": result[4].strftime("%Y-%m-%d %H:%M:%S") if result[4] else None,
                "email": result[5],
                "first_name": result[6] or "",
                "last_name": result[7] or "",
                "profile_pic": result[8] or ""
            }
            reviews.append(review)
        
        return {"success": True, "reviews": reviews}
        
    except Exception as e:
        return {"error": f"Failed to get reviews: {str(e)}"}
    
    
async def add_flag(data: models.C_Flag):
    """
    Check if the same user_id and product_id already exist in the flags table
    If they do, return an error message
    If they dont then insert the flag into the flags table
    Count the total number of flags for the product
    if > 3
    then delete the product from the products table
    and delete the flags for the product
    """
    try:
        conn, cursor = database.make_db()
        
        # Check if the flag already exists
        check_query = """
            SELECT * FROM c_flags WHERE user_id = %s AND product_id = %s
        """
        cursor.execute(check_query, (data.user_id, data.product_id))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return {"error": "You have already flagged this product."}
        
        # Add the flag
        insert_query = """
            INSERT INTO c_flags (user_id, product_id, flag_reason, active, date_added)
            VALUES (%s, %s, %s, TRUE, %s)
        """
        cursor.execute(insert_query, (data.user_id, data.product_id, data.flag_reason, data.date_added))
         
        # Count the total number of flags for the product
        count_query = """
            SELECT COUNT(*) FROM c_flags WHERE product_id = %s AND active = TRUE
        """
        cursor.execute(count_query, (data.product_id,))
        flag_count = cursor.fetchone()[0]
        
        # If more than 3 flags, delete the product and its flags
        if flag_count > 3:
            delete_product_query = """
                DELETE FROM c_products WHERE product_id = %s
            """
            delete_flags_query = """
                DELETE FROM c_flags WHERE product_id = %s
            """
            cursor.execute(delete_product_query, (data.product_id,))
            cursor.execute(delete_flags_query, (data.product_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": True, "message": "Product flagged successfully."}
        
    except Exception as e:
        return {"error": f"Failed to flag product: {str(e)}"}
    
    
async def get_added_products(data: models.C_GetAddedProducts):
    """
    Get all the products from the c_products table whose user_id matches.
    """
    try:
        conn, cursor = database.make_db()
        
        # Fetch products added by the user
        query = """
            SELECT p.product_id, p.product_name, p.product_price, p.product_rating, p.product_description, 
                   p.product_stock, p.product_images, p.product_category, s.shop_name, s.shop_rating, s.shop_area
            FROM c_products p
            RIGHT JOIN c_shops s ON p.shop_id = s.shop_id
            WHERE p.user_id = %s
        """
        cursor.execute(query, (data.user_id,))
        results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        if not results:
            return {"success": True, "products": []}
        
        # Format the results into a list of dictionaries
        products = []
        for result in results:
            product = {
                "product_id": result[0],
                "product_name": result[1],
                "product_price": float(result[2]),
                "product_rating": result[3],
                "product_description": result[4],
                "product_stock": result[5],
                "product_images": result[6],
                "product_category": result[7],
                "shop_name": result[8],
                "shop_rating": result[9],
                "shop_address": result[10]
            }
            products.append(product)
        
        return {"success": True, "products": products}
        
    except Exception as e:
        return {"error": f"Failed to get added products: {str(e)}"}


async def get_username(data: models.C_GetUsername):
    """
    Get the username from the c_users table using the user_id
    """
    try:
        conn, cursor = database.make_db()
        
        # Fetch username
        query = """
            SELECT first_name, last_name FROM c_profiles WHERE user_id = %s
        """
        cursor.execute(query, (data.user_id,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not result:
            return {"error": "User not found."}
        
        return {"success": True, "username": result[0] + " " + result[1]}
        
    except Exception as e:
        return {"error": f"Failed to get username: {str(e)}"}
    
async def s_get_username(data: models.C_GetUsername):
    """
    Get the username from the c_users table using the user_id
    """
    try:
        conn, cursor = database.make_db()
        
        # Fetch username
        query = """
            SELECT first_name, last_name FROM s_profiles WHERE user_id = %s
        """
        cursor.execute(query, (data.user_id,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not result:
            return {"error": "User not found."}
        
        return {"success": True, "username": result[0] + " " + result[1]}
        
    except Exception as e:
        return {"error": f"Failed to get username: {str(e)}"}
    
    
async def delete_user(data: models.C_DeleteUser):
    """
    If the password and the session_id both match then delete the user from all tables.
    Also delete all the entries made in every table by the user.
    """
    try:
        conn, cursor = database.make_db()
        
        # Check if the user exists
        check_query = """
            SELECT * FROM c_users WHERE user_id = %s
        """
        cursor.execute(check_query, (data.user_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return {"error": "User not found."}
        
        # Check if the password is correct
        check_password_query = """
            SELECT hashed_password FROM c_users WHERE user_id = %s
        """
        cursor.execute(check_password_query, (data.user_id,))
        result = cursor.fetchone()
        
        if not bcrypt.checkpw(data.password.encode('utf-8'), result[0].encode('utf-8')):
            cursor.close()
            conn.close()
            return {"error": "Incorrect password."}
        
        # Delete the user from all tables
        delete_query = """
            DELETE FROM c_users WHERE user_id = %s
        """
        cursor.execute(delete_query, (data.user_id,))
        
        # Delete all entries made by the user in other tables
        delete_products_query = """
            DELETE FROM c_products WHERE user_id = %s
        """
        cursor.execute(delete_products_query, (data.user_id,))
        
        delete_wishlist_query = """
            DELETE FROM c_wishlists WHERE user_id = %s
        """
        cursor.execute(delete_wishlist_query, (data.user_id,))
        
        delete_reviews_query = """
            DELETE FROM c_reviews WHERE user_id = %s
        """
        cursor.execute(delete_reviews_query, (data.user_id,))
        
        delete_flags_query = """
            DELETE FROM c_flags WHERE user_id = %s
        """
        cursor.execute(delete_flags_query, (data.user_id,))
        delete_profiles_query = """
            DELETE FROM c_profiles WHERE user_id = %s
        """
        cursor.execute(delete_profiles_query, (data.user_id,))
        return {"success": True, "message": "User deleted successfully."}
    except Exception as e:
        return {"error": f"Failed to delete user: {str(e)}"}
    
    finally:
        conn.commit()
        cursor.close()
        conn.close()
        
async def product_follow(data: models.C_ProductFollow):
    """
    Add a product follow entry to the c_product_follows table.
    If the user is already following the product, return a message indicating so.
    """
    try:
        conn, cursor = database.make_db()
        
        # Check if the user is already following the product
        check_query = """
            SELECT * FROM c_product_follows WHERE user_id = %s AND product_id = %s
        """
        cursor.execute(check_query, (data.user_id, data.product_id))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return {"success": True, "message": "You are already following this product."}
        
        # Add the follow entry
        insert_query = """
            INSERT INTO c_product_follows (user_id, product_id)
            VALUES (%s, %s)
        """
        cursor.execute(insert_query, (data.user_id, data.product_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": True, "message": "You are now following this product."}
        
    except Exception as e:
        return {"error": f"Failed to follow product: {str(e)}"}

async def get_followed_products(data: models.C_GetFollowedProducts):
    """
    Get all products that the user is following.
    Returns product details for each followed product.
    """
    try:
        conn, cursor = database.make_db()
        
        # Join c_product_follows and c_products to get product details
        query = """
            SELECT 
            p.product_id,
            p.product_name,
            p.product_price,
            p.product_rating,
            p.product_description,
            p.product_review,
            p.product_stock,
            p.product_images,
            p.product_category,
            s.shop_name,
            s.shop_rating,
            s.shop_type,
            s.shop_email,
            s.shop_phone_number,
            s.shop_area,
            s.shop_city,
            s.shop_description,
            s.shop_images,
            s.shop_latitude,
            s.shop_longitude
            FROM 
            c_product_follows f
            JOIN 
            c_products p ON f.product_id = p.product_id
            JOIN 
            c_shops s ON p.shop_id = s.shop_id
            WHERE 
            f.user_id = %s
        """
        cursor.execute(query, (data.user_id,))
        results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        if not results:
            return {"success": True, "followed_products": []}
        
        # Format the results
        followed_products = []
        for result in results:
            product = {
                "product_id": result[0],
                "product_name": result[1],
                "product_price": result[2],
                "product_rating": result[3],
                "product_description": result[4],
                "product_review": result[5],
                "product_stock": result[6],
                "product_images": result[7],
                "product_category": result[8],
                "shop_name": result[9],
                "shop_rating": result[10],
                "shop_type": result[11],
                "shop_email": result[12],
                "shop_phone_number": result[13],
                "shop_address": result[14],
                "shop_google_map_link": result[15],
                "shop_review": result[16],
                "shop_images": result[17],
            }
            followed_products.append(product)
        
        return {"success": True, "followed_products": followed_products}
        
    except Exception as e:
        return {"error": f"Failed to get followed products: {str(e)}"}
    
async def product_unfollow(data: models.C_ProductUnfollow):
    """
    Remove a product follow entry from the c_product_follows table.
    If the user is not following the product, return a message indicating so.
    """
    try:
        conn, cursor = database.make_db()
        
        # Check if the user is following the product
        check_query = """
            SELECT * FROM c_product_follows WHERE user_id = %s AND product_id = %s
        """
        cursor.execute(check_query, (data.user_id, data.product_id))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return {"success": True, "message": "You are not following this product."}
        
        # Remove the follow entry
        delete_query = """
            DELETE FROM c_product_follows WHERE user_id = %s AND product_id = %s
        """
        cursor.execute(delete_query, (data.user_id, data.product_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": True, "message": "You have unfollowed this product."}
        
    except Exception as e:
        return {"error": f"Failed to unfollow product: {str(e)}"}
    
async def c_add_profile(data: models.addProfile):
    """
    Check if the token is valid
    If valid, insert the profile data into the profile table
    """
    try:
        # fetch the email from the token
        conn, cursor = database.make_db()
        # then insert the new entry
        insert_query = """
            INSERT INTO c_profiles (
                user_id,
                email,
                first_name,
                last_name,
                age,
                gender,
                phone_number,
                pic
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            data.user_id,
            data.email,
            data.first_name,
            data.last_name,
            data.age,
            data.gender,
            data.phone_number,
            data.pic
        ))
        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "Profile created successfully."}

    except Exception as e:
        return {"error": f"Failed to create profile: {str(e)}"}
    
async def get_wishlist(data: models.getWishList):
    """
    Get all the products from the c_wishlists table whose user_id matches.
    """
    try:
        conn, cursor = database.make_db()
        
        # Fetch products in the wishlist
        query = """
            SELECT p.product_id, p.product_name, p.product_price, p.product_rating, p.product_description, 
               p.product_stock, p.product_images, p.product_category, s.shop_name, s.shop_rating, 
               CONCAT(s.shop_area, ', ', s.shop_city) AS shop_address
            FROM c_wishlists w
            JOIN c_products p ON w.product_id = p.product_id
            JOIN c_shops s ON p.shop_id = s.shop_id
            WHERE w.user_id = %s
            ORDER BY p.product_name ASC
        """
        cursor.execute(query, (data.user_id,))
        results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        if not results:
            return {"success": True, "products": []}
        
        # Format the results into a list of dictionaries
        products = []
        for result in results:
            product = {
                "product_id": result[0],
                "product_name": result[1],
                "product_price": float(result[2]),
                "product_rating": result[3],
                "product_description": result[4],
                "product_stock": result[5],
                "product_images": result[6],
                "product_category": result[7],
                "shop_name": result[8],
                "shop_rating": result[9],
                "shop_location": result[10]
            }
            products.append(product)
        
        return {"success": True, "products": products}
        
    except Exception as e:
        return {"error": f"Failed to get wishlist: {str(e)}"}
    
    
async def remove_from_wishlist(data: models.removeFromWishList):
    """
    Remove a product from the user's wishlist.
    """
    try:
        conn, cursor = database.make_db()
        
        # Remove the product from the wishlist
        delete_query = """
            DELETE FROM c_wishlists WHERE user_id = %s AND product_id = %s
        """
        cursor.execute(delete_query, (data.user_id, data.product_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": True, "message": "Product removed from wishlist successfully."}
        
    except Exception as e:
        return {"error": f"Failed to remove from wishlist: {str(e)}"}
    
    
async def get_user_reviews(data: models.C_GetUserReviews):
    """
    Get all reviews made by the user, including product and shop details.
    """
    try:
        conn, cursor = database.make_db()
        
        # Fetch user reviews with product and shop details
        query = """
            SELECT 
            r.review_id, 
            r.product_id, 
            r.rating, 
            r.review_text, 
            r.date_added, 
            p.product_name, 
            p.product_price, 
            p.product_description, 
            p.product_rating, 
            s.shop_name, 
            CONCAT(s.shop_area, ', ', s.shop_city) AS shop_address, 
            s.shop_rating
            FROM 
            c_reviews r
            JOIN 
            c_products p ON r.product_id = p.product_id
            JOIN 
            c_shops s ON p.shop_id = s.shop_id
            WHERE 
            r.user_id = %s
            ORDER BY 
            r.date_added DESC
        """
        cursor.execute(query, (data.user_id,))
        results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        if not results:
            return {"success": True, "reviews": []}
        
        # Format the results into a list of dictionaries
        reviews = []
        for result in results:
            review = {
                "review_id": result[0],
                "product_id": result[1],
                "rating": result[2],
                "review_text": result[3],
                "date_added": result[4].strftime("%Y-%m-%d %H:%M:%S") if result[4] else None,
                "product_name": result[5],
                "product_price": float(result[6]),
                "product_description": result[7],
                "product_rating": result[8],
                "shop_name": result[9],
                "shop_location": result[10],
                "shop_rating": result[11]
            }
            reviews.append(review)
        
        return {"success": True, "reviews": reviews}
        
    except Exception as e:
        return {"error": f"Failed to get user reviews: {str(e)}"}
    
async def fetch_flags(data: models.C_FetchFlags):
    """
    Fetch all flags for a product, including user, product, and shop information.
    """
    try:
        conn, cursor = database.make_db()
        
        # Fetch flags with user, product, and shop details
        query = """
            SELECT 
            f.user_id, 
            f.product_id, 
            f.flag_reason, 
            u.email, 
            p.first_name, 
            p.last_name,
            pr.product_name,
            pr.product_description,
            pr.product_price,
            pr.product_rating,
            pr.product_stock,
            pr.product_images,
            s.shop_name,
            s.shop_rating,
            s.shop_type,
            s.shop_email,
            s.shop_phone_number,
            CONCAT(s.shop_area, ', ', s.shop_city) AS shop_address,
            s.shop_latitude,
            s.shop_longitude
            FROM 
            c_flags f
            JOIN 
            c_users u ON f.user_id = u.user_id
            LEFT JOIN 
            c_profiles p ON f.user_id = p.user_id
            JOIN 
            c_products pr ON f.product_id = pr.product_id
            JOIN 
            c_shops s ON pr.shop_id = s.shop_id
            WHERE 
            f.user_id = %s
        """
        cursor.execute(query, (data.user_id,))
        results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        if not results:
            return {"success": True, "flags": []}
        
        # Format the results into a list of dictionaries
        flags = []
        for result in results:
            flag = {
                "user_id": result[0],
                "product_id": result[1],
                "flag_reason": result[2],
                "email": result[3],
                "first_name": result[4] or "",
                "last_name": result[5] or "",
                "product_name": result[6],
                "product_description": result[7],
                "product_price": result[8],  # product_price is stored as TEXT
                "product_rating": result[9],
                "product_stock": result[10],  # product_stock is stored as TEXT
                "product_images": result[11],
                "shop_name": result[12],
                "shop_rating": result[13],
                "shop_type": result[14],
                "shop_email": result[15],
                "shop_phone_number": result[16],
                "shop_address": result[17],
                "shop_latitude": result[18],
                "shop_longitude": result[19],
            }
            flags.append(flag)
        
        return {"success": True, "flags": flags}
        
    except Exception as e:
        return {"error": f"Failed to fetch flags: {str(e)}"}
    
    
async def get_shop_details(data: models.C_ShopDetails):
    """
    Return shops whose city matches exactly and name is similar (fuzzy match).
    Returns: shop_name, shop_area, shop_city, shop_id, shop_email
    """
    try:
        conn, cursor = database.make_db()
        
        
        if data.shop_id != "":
            # If shop_id is provided, fetch details for that specific shop
            print(data.shop_id)
            query = """
                SELECT 
                    shop_name,
                    shop_area,
                    shop_city,
                    shop_id,
                    shop_email
                FROM 
                    c_shops
                WHERE 
                    shop_id = %s
            """
            cursor.execute(query, (data.shop_id,))
            result = cursor.fetchone()
            
            if not result:
                return {"error": "Shop not found."}
            
            return {
                "success": True,
                "shops": [
                    {
                        "shop_name": result[0],
                        "shop_area": result[1],
                        "shop_city": result[2],
                        "shop_id": result[3],
                        "shop_email": result[4],
                    }
                ]
            }
        

        query = """
            SELECT 
                shop_name,
                shop_area,
                shop_city,
                shop_id,
                shop_email
            FROM 
                c_shops
            WHERE 
                shop_city = %s OR shop_name ILIKE %s OR shop_area ILIKE %s
        """

        name_pattern = f"%{data.shop_name.strip()}%"
        cursor.execute(query, (data.shop_city.strip(), name_pattern, data.shop_area.strip()))
        results = cursor.fetchall()

        cursor.close()
        conn.close()

        shops = [
            {
                "shop_name": row[0],
                "shop_area": row[1],
                "shop_city": row[2],
                "shop_id": row[3],
                "shop_email": row[4],
            }
            for row in results
        ]

        return {"success": True, "shops": shops}

    except Exception as e:
        return {"error": f"Failed to fetch shop details: {str(e)}"} 


async def register_seller(person: models.S_RegisterRequest):
    """
    Take email and password
    Generate the hash of the password
    Generate the OTP
    Send the OTP to the email
    Save the email, hashed_password and OTP in the user_otp table
    """
    # Generate the hash of the password
    hashed_password = bcrypt.hashpw(person.password.encode('utf-8'), bcrypt.gensalt())
    # Generate the OTP
    otp = random.randint(100000, 999999)
    
    # SMTP configuration
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    smtp_user = "sweprojectgr14@gmail.com"
    smtp_password = "ztrexujzddttjbak"
    if not is_valid_email(person.email):
        print({"error": f"Invalid recipient email address: {person.email}"})
        return {"error": "Invalid email address."}
    # Create the email content
    message = MIMEMultipart()
    message["From"] = smtp_user
    message["To"] = person.email
    message["Subject"] = "Product Locator Registration | Seller | Your OTP Code"
    body = f"Your OTP is: {otp}"
    message.attach(MIMEText(body, "plain"))

    # Send the email
    
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
            print(f"Email sent to {person.email}")
    except Exception as e:
        return {"error": f"Failed to send email : {person.email} {e}"}
    
    # Generate a unique user_id
    user_id = str(random.randint(100000, 999999))
    # Check if the user_id already exists
    try:
        connection, cursor = database.make_db()
        cursor.execute("SELECT 1 FROM s_users WHERE user_id = %s", (user_id,))
        if cursor.fetchone():
            return {"error": "User ID already exists. Please try again."}
    except Exception as e:
        return {"error": f"Database error: {e}"}
    
    # Save the email, hashed_password, and OTP in the user_otp table
    try:
        connection, cursor = database.make_db()
        insert_query = """
            INSERT INTO s_user_otp (user_id, email, hashed_password, otp_code)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            user_id,
            person.email,
            hashed_password.decode('utf-8'),
            otp
        ))
        connection.commit()
        cursor.close()
        connection.close()
        return {
            "success": True,
            "message": "OTP sent to your email. Please verify to complete registration.",
            "user_id": user_id,
            "otp": otp
        }
    except Exception as e:
        return {
            "error": f"Failed to save user data: {e}",
        }
        
async def s_verify_otp(person: models.S_OTPVerification):
    """
    Get the email and otp
    Fetch email, hashed_password and OTP from the user_otp table
    Compare the OTP and email with the one in the database
    If they match, delete the OTP from the user_otp table
    Add it to the users table
    """

    # Step 1: Connect to DB
    try:
        conn, cursor = database.make_db()

        # Step 2: Fetch the entry
        cursor.execute(
            "SELECT user_id, email, hashed_password, otp_code FROM s_user_otp WHERE user_id = %s",
            (person.user_id,)
        )
        result = cursor.fetchall()

        if not result:
            return {"error": "Email not found or OTP expired."}

        db_user_id, db_email, db_hashed_password, db_otp = result[0]

        # Step 3: Compare OTP
        if str(db_otp) != str(person.otp):
            return {"error": "Invalid OTP."}
        

        # Step 4: Insert into users table
        cursor.execute(
            "INSERT INTO s_users (user_id, email, hashed_password) VALUES (%s, %s, %s)",
            (db_user_id, db_email, db_hashed_password,)
        )

        # Step 5: Delete from user_otp table
        cursor.execute("DELETE FROM s_user_otp WHERE user_id = %s", (db_user_id,))

        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "User verified and registered successfully."}

    except Exception as e:
        return {"success": False, "message": f"An error occurred: {str(e)}"}
    
async def login_seller(person: models.S_LoginRequest):
    """
    Get the email and password
    Fetch the hashed password from the users table
    Compare with the input password
    If same then generate a token using the following algorithm:
    String concatenate the current time + email
    Hash this string and return it
    """
    try:
        conn, cursor = database.make_db()

        # Fetch stored hashed password
        cursor.execute("SELECT user_id, email, hashed_password FROM s_users WHERE email = %s", (person.email,))
        result = cursor.fetchone()

        if not result:
            return {"error": "Invalid email or password."}

        user_id = result[0]
        email = result[1]
        stored_hashed_password = result[2]
        
        # Verify password
        if not bcrypt.checkpw(person.password.encode('utf-8'), stored_hashed_password.encode('utf-8')):
            return {"error": "Invalid email or password."}

        cursor.close()
        conn.close()

        return {"success": True, "user_id": user_id, "email": email}

    except Exception as e:
        return {"error": f"Login failed: {str(e)}"}
    
async def s_add_profile(data: models.addProfile):
    """
    Check if the token is valid
    If valid, insert the profile data into the profile table
    """
    try:
        # fetch the email from the token
        conn, cursor = database.make_db()
        # then insert the new entry
        insert_query = """
            INSERT INTO s_profiles (
                user_id,
                email,
                first_name,
                last_name,
                age,
                gender,
                phone_number,
                pic
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            data.user_id,
            data.email,
            data.first_name,
            data.last_name,
            data.age,
            data.gender,
            data.phone_number,
            data.pic
        ))
        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "Profile created successfully."}

    except Exception as e:
        return {"error": f"Failed to create profile: {str(e)}"}
    
async def shop_details(data: models.S_ShopDetails):
    """
    Add a new shop to the database after validating the session.
    Generates a unique 4-digit shop_id.
    """
    try:
        conn, cursor = database.make_db()

        # Generate a unique 4-digit shop ID
        while True:
            shop_id = str(random.randint(1000, 9999))
            cursor.execute("SELECT 1 FROM shops WHERE shop_id = %s", (shop_id,))
            if not cursor.fetchone():
                break

        # Insert the shop details into the database
        insert_query = """
            INSERT INTO shops (
                user_id,
                shop_id,
                shop_name,
                shop_type,
                shop_area,
                shop_city,
                shop_email,
                shop_phone_number,
                shop_images,
                shop_description,
                shop_rating,
                shop_owned,
                shop_latitude,
                shop_longitude
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(insert_query, (
            data.user_id,
            shop_id,
            data.shop_name,
            data.shop_type,
            data.shop_area,
            data.shop_city,
            data.shop_email,
            data.shop_phone_number,
            data.shop_images,
            data.shop_description,
            data.shop_rating,
            True,  # Assuming the shop is owned by the user adding it
            data.shop_latitude,
            data.shop_longitude
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "Shop added successfully.", "shop_id": shop_id}

    except Exception as e:
        return {"error": f"Failed to add shop: {str(e)}"}
