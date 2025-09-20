from pydantic import BaseModel

class C_RegisterRequest(BaseModel):
    email: str
    password: str

class S_RegisterRequest(BaseModel):
    email: str
    password: str

class C_OTPVerification(BaseModel):
    user_id: str
    otp: str
    
class S_OTPVerification(BaseModel):
    user_id: str
    otp: str

class C_LoginRequest(BaseModel):
    email: str
    password: str
    
class S_LoginRequest(BaseModel):
    email: str
    password: str   
    
class C_ProfileRequest(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    age: int
    gender: str
    pic: str
    phone_number: str

class C_NewShop(BaseModel):
    user_id: str
    shop_name: str
    shop_type: str
    shop_location: str
    shop_email: str
    shop_phone_number: str
    shop_pic: str
    
class C_GetProfile(BaseModel):
    user_id: str
    
class C_Product(BaseModel):
    user_id: str
    product_name: str
    product_price: str
    product_category: str
    product_stock: str
    product_rating: int
    product_description: str
    product_review: str
    product_images: list[str] | None
    # delivery: bool
    shop_id: str
    shop_name: str
    shop_area: str
    shop_city: str
    shop_type: str
    shop_email: str
    shop_phone_number: str
    shop_images: list[str] | None
    shop_description: str
    shop_rating: int
    shop_latitude: float
    shop_longitude: float

class C_EditProduct(BaseModel):
    product_id: str
    user_id: str
    product_name: str
    product_price: str
    product_rating: int
    product_description: str
    product_stock: str
    product_review: str
    product_images: list[str] | None
    product_category: str
    # delivery: bool
    shop_name: str
    shop_rating: int
    shop_type: str
    shop_email: str
    shop_phone_number: str
    shop_address: str
    shop_google_map_link: str
    shop_review: str
    shop_images: list[str] | None
    
class C_ProductSearch(BaseModel):
    search: str
    # category: list[str]
    
class C_WishlistItem(BaseModel):
    user_id: str
    product_id: str

class C_GetWishlist(BaseModel):
    user_id: str
    
class C_ProductDetails(BaseModel):
    product_id: str

class C_EditProduct(BaseModel):
    user_id: str
    product_id: str
    product_name: str
    product_price: str
    product_rating: int
    product_description: str
    product_stock: str
    product_review: str
    product_images: list[str]
    shop_name: str
    shop_rating: int
    shop_type: str
    shop_email: str
    shop_phone_number: str
    shop_address: str
    shop_google_map_link: str
    shop_review: str
    shop_images: list[str]
    product_category: str


class C_AddReview(BaseModel):
    user_id: str
    product_id: str
    rating: int
    review_text: str

class C_GetReviews(BaseModel):
    product_id: str
    
class C_Flag(BaseModel):
    user_id: str
    product_id: str
    flag_reason: str
    
class C_GetAddedProducts(BaseModel):
    user_id: str
    
class C_GetUsername(BaseModel):
    user_id: str
    
class C_DeleteUser(BaseModel):
    user_id: str
    password: str
    
class C_ProductFollow(BaseModel):
    user_id: str
    product_id: str
    
class C_GetFollowedProducts(BaseModel):
    user_id: str
    
class C_ProductUnfollow(BaseModel):
    user_id: str
    product_id: str
    
    
class addProfile(BaseModel):
    user_id: str
    email: str
    first_name: str
    last_name: str
    age: int
    gender: str
    pic: str
    phone_number: str
    
class getWishList(BaseModel):
    user_id: str
    
class removeFromWishList(BaseModel):
    user_id: str
    product_id: str
    
class C_GetUserReviews(BaseModel):
    user_id: str
    
class C_FetchFlags(BaseModel):
    user_id: str
    
class C_ShopDetails(BaseModel):
    shop_id: str
    shop_name: str
    shop_city: str
    shop_area: str
    
class S_ShopDetails(BaseModel):
    user_id: str
    shop_name: str
    shop_area: str
    shop_city: str
    shop_type: str
    shop_email: str
    shop_phone_number: str
    shop_images: list[str] | None
    shop_description: str
    shop_rating: int
    shop_latitude: float
    shop_longitude: float
    
