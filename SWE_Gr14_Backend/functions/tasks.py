from models import models
from dotenv import load_dotenv
import database
import bcrypt
import os
import random
import time
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import base64
from typing import Optional, Dict, Any
from Crypto.Util.Padding import pad, unpad
load_dotenv()

async def register_user(person: models.RegisterRequest):
    """
    Check if the user already exists in the database.
    If not, hash the password, generate a 6-digit OTP, and insert into the otp_users table.
    """
    connection, cursor = database.make_db()
    hashed_password = bcrypt.hashpw(person.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        # Check if user already exists
        cursor.execute("SELECT * FROM otp_users WHERE email = %s", (person.email, hashed_password))
        existing_user = cursor.fetchone()
        if existing_user:
            return {"error": "User already exists."}

        # Generate a 6-digit OTP
        otp = str(random.randint(100000, 999999))

        # Insert into otp_users table
        cursor.execute(
            "INSERT INTO otp_users (email, password, otp) VALUES (%s, %s, %s)",
            (person.email, hashed_password, otp)
        )
        connection.commit()

        return {"message": "User registered successfully. OTP sent to email."}

    except Exception as e:
        connection.rollback()
        return {"error": str(e)}
    
    finally:
        cursor.close()
        connection.close()
        

async def register_verify_otp(otp: models.VerifyOtpRequest):
    """
    Verify the OTP sent by the user.
    If correct, move the user from otp_users table to users table.
    """
    connection, cursor = database.make_db()

    try:
        # Fetch the user from otp_users
        cursor.execute("SELECT email, password, otp FROM otp_users WHERE email = %s", (otp.email,))
        user_data = cursor.fetchone()

        if not user_data:
            return {"error": "No registration found for this email."}

        db_email, db_password, db_otp = user_data

        # Verify OTP
        if otp.otp != db_otp:
            return {"error": "Invalid OTP."}

        # Insert the user into the final users table
        cursor.execute(
            "INSERT INTO users (email, password, is_verified) VALUES (%s, %s, %s)",
            (db_email, db_password, True)
        )

        # Delete the user from otp_users table
        cursor.execute("DELETE FROM otp_users WHERE email = %s", (db_email,))

        connection.commit()

        return {
            "message": "User verified and registered successfully."
        }

    except Exception as e:
        connection.rollback()
        return {"error": str(e)}
    
    finally:
        cursor.close()
        connection.close()


async def login_user(person: models.LoginRequest):
    """
    Get the email and password from the person
    Check if the user exists in the database.
    If exists, check if the password matches.
    If doesnt match then return error
    If matches then generate the token with the algorithm... 
        String concatonate the current time + email + limit time and encrypt it with AES_CBS where the key is in the .env
    """
    AES_KEY = os.getenv("AES_KEY").encode()
    TIME_LIMIT = os.getenv("TIME_LIMIT")
    connection, cursor = database.make_db()

    try:
        # Fetch user from users table
        cursor.execute("SELECT email, password FROM users WHERE email = %s", (person.email))
        user_data = cursor.fetchone()

        if not user_data:
            return {"error": "User does not exist."}

        db_email, db_password = user_data

        # Verify password
        if not bcrypt.checkpw(person.password.encode('utf-8'), db_password.encode('utf-8')):
            return {"error": "Incorrect password."}

        # Prepare token data
        current_time = str(int(time.time()))
        token_data = current_time + person.email

        # AES CBC Encryption
        cipher = AES.new(AES_KEY, AES.MODE_CBC)
        ct_bytes = cipher.encrypt(pad(token_data.encode('utf-8'), AES.block_size))

        # The IV (Initialization Vector) must be stored along with ciphertext
        iv = cipher.iv
        token = base64.b64encode(iv + ct_bytes).decode('utf-8')

        return {"token": token}

    except Exception as e:
        return {"error": str(e)}
    
    finally:
        cursor.close()
        connection.close()
    
    
    
def get_aes_cipher():
    AES_KEY = os.getenv("AES_KEY").encode()
    return AES.new(AES_KEY, AES.MODE_CBC)

def decrypt_token(token: str) -> Dict[str, Any]:
    try:
        data = base64.b64decode(token)
        iv = data[:AES.block_size]
        cipher = AES.new(os.getenv("AES_KEY").encode(), AES.MODE_CBC, iv)
        decrypted = unpad(cipher.decrypt(data[AES.block_size:]), AES.block_size).decode()
        timestamp, email = decrypted.split(':', 1)
        return {'email': email, 'timestamp': timestamp}
    except Exception as e:
        return {'error': 'Invalid token'}

# Profile Management
async def get_profile(user_id: str) -> Dict:
    """Retrieve user profile with role-specific details"""
    connection, cursor = database.make_db()
    try:
        # Get base user info
        cursor.execute("""
            SELECT u.email, u.is_verified, p.* 
            FROM users u
            LEFT JOIN user_profiles p ON u.email = p.user_email
            WHERE u.email = %s
        """, (user_id,))
        profile = cursor.fetchone()
        
        if not profile:
            return {"error": "User not found"}
            
        # Structure response
        response = {
            "email": profile[0],
            "is_verified": profile[1],
            "name": profile[3],
            "profile_picture": profile[4],
            "role": profile[5],
            "preferences": profile[6]
        }
        
        # Add role-specific fields
        if profile[5] == 'seller':
            cursor.execute("""
                SELECT store_name, store_address, store_type 
                FROM seller_profiles 
                WHERE user_email = %s
            """, (user_id,))
            seller_info = cursor.fetchone()
            if seller_info:
                response.update({
                    "store_name": seller_info[0],
                    "store_address": seller_info[1],
                    "store_type": seller_info[2]
                })
        
        return response
        
    except Exception as e:
        return {"error": str(e)}
    finally:
        cursor.close()
        connection.close()
    

async def create_update_profile(profile_data: models.ProfileRequest, token: str) -> Dict:
    """Create or update user profile with role-specific handling"""
    # Authentication
    decrypted = decrypt_token(token)
    if 'error' in decrypted:
        return decrypted
    email = decrypted['email']
    
    connection, cursor = database.make_db()
    try:
        # Base profile data
        cursor.execute("""
            INSERT INTO user_profiles 
            (user_email, name, profile_picture, role, preferences)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (user_email) DO UPDATE SET
                name = EXCLUDED.name,
                profile_picture = EXCLUDED.profile_picture,
                preferences = EXCLUDED.preferences
        """, (
            email,
            profile_data.name,
            profile_data.profile_picture,
            profile_data.role,
            profile_data.preferences
        ))
        
        # Handle seller-specific data
        if profile_data.role == 'seller':
            cursor.execute("""
                INSERT INTO seller_profiles 
                (user_email, store_name, store_address, store_type)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_email) DO UPDATE SET
                    store_name = EXCLUDED.store_name,
                    store_address = EXCLUDED.store_address,
                    store_type = EXCLUDED.store_type
            """, (
                email,
                profile_data.store_name,
                profile_data.store_address,
                profile_data.store_type
            ))
        
        connection.commit()
        return {"message": "Profile updated successfully"}
        
    except Exception as e:
        connection.rollback()
        return {"error": str(e)}
    finally:
        cursor.close()
        connection.close()

# Product Management (partial implementation)
async def add_product(product_data: models.ProductRequest, token: str) -> Dict:
    """Add new product listing with inventory tracking"""
    # Authentication and authorization
    decrypted = decrypt_token(token)
    if 'error' in decrypted:
        return decrypted
        
    connection, cursor = database.make_db()
    try:
        # Insert product
        cursor.execute("""
            INSERT INTO products 
            (seller_email, name, description, price, quantity, category, tags, images)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING product_id
        """, (
            decrypted['email'],
            product_data.name,
            product_data.description,
            product_data.price,
            product_data.quantity,
            product_data.category,
            product_data.tags,
            product_data.images
        ))
        
        product_id = cursor.fetchone()[0]
        
        # Insert inventory record
        cursor.execute("""
            INSERT INTO inventory 
            (product_id, quantity, location)
            VALUES (%s, %s, %s)
        """, (
            product_id,
            product_data.quantity,
            product_data.location
        ))
        
        connection.commit()
        return {"product_id": product_id, "message": "Product added successfully"}
        
    except Exception as e:
        connection.rollback()
        return {"error": str(e)}
    finally:
        cursor.close()
        connection.close()

# Search Functionality
async def search_products(search_query: models.SearchRequest) -> Dict:
    """Search products with filters and pagination"""
    connection, cursor = database.make_db()
    try:
        base_query = """
            SELECT p.*, s.store_name, s.store_address 
            FROM products p
            JOIN seller_profiles s ON p.seller_email = s.user_email
            WHERE 1=1
        """
        params = []
        
        # Add filters
        if search_query.name:
            base_query += " AND p.name ILIKE %s"
            params.append(f"%{search_query.name}%")
            
        if search_query.category:
            base_query += " AND p.category = %s"
            params.append(search_query.category)
            
        if search_query.min_price:
            base_query += " AND p.price >= %s"
            params.append(search_query.min_price)
            
        if search_query.max_price:
            base_query += " AND p.price <= %s"
            params.append(search_query.max_price)
            
        # Pagination
        base_query += " LIMIT %s OFFSET %s"
        params.extend([search_query.limit, search_query.offset])
        
        cursor.execute(base_query, params)
        results = cursor.fetchall()
        
        # Convert to dict format
        products = []
        for row in results:
            products.append({
                "product_id": row[0],
                "name": row[2],
                "price": float(row[4]),
                "quantity": row[5],
                "store_name": row[9],
                "store_address": row[10]
            })
            
        return {"results": products}
        
    except Exception as e:
        return {"error": str(e)}
    finally:
        cursor.close()
        connection.close()

    

