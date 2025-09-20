from fastapi import FastAPI, Depends, UploadFile, Header
from fastapi.middleware.cors import CORSMiddleware
from functions import tasks2 as tasks
from models import models

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the API!"}

@app.post("/c_register")
async def register(person: models.C_RegisterRequest):
    response = await tasks.register_user(person)
    return response

@app.post("/c_verify_otp")
async def verify_otp(data: models.C_OTPVerification):
    response = await tasks.verify_otp(data)
    if response.get("error"):
        return {"error": response["error"]}
    return response

@app.post("/c_edit_profile")
async def edit_profile(data: models.C_ProfileRequest):
    response = await tasks.edit_profile(data)
    return response

@app.post("/c_login")
async def login(data: models.C_LoginRequest):
    response = await tasks.login_user(data)
    return response


@app.post("/c_get_profile")
async def get_profile(data: models.C_GetProfile):
    response = await tasks.get_profile(data)
    return response

@app.post("/get_product")
async def get_product(data: models.C_ProductSearch):
    """
    Search for products based on search term and optional category.
    Query parameters:
    - search: The search term
    - category (optional): Filter by category
    """
    response = await tasks.get_product(data.search)
    return response

@app.post("/c_add_product")
async def add_product(data: models.C_Product):
    response = await tasks.add_product(data)
    return response

@app.post("/c_edit_product")
async def edit_product(data: models.C_EditProduct):
    response = await tasks.edit_product(data)
    return response

@app.post("/c_get_product_details")
async def get_product_details(data: models.C_ProductDetails):
    response = await tasks.get_product_details(data)
    return response

@app.post("/c_add_review")
async def add_review(data: models.C_AddReview):
    response = await tasks.add_review(data)
    return response

@app.post("/c_get_reviews")
async def get_reviews(data: models.C_GetReviews):
    response = await tasks.get_reviews(data)
    return response

@app.post("/c_add_to_wishlist")
async def add_to_wishlist(data: models.C_WishlistItem):
    response = await tasks.add_to_wishlist(data)
    return response


# ================
# @app.post("/add_shop")
# async def add_shop(data: models.C_NewShop):
#     response = await tasks.add_shop(data)
#     return response

@app.post("/c_get_added_products")
async def get_added_products(data: models.C_GetAddedProducts):
    response = await tasks.get_added_products(data)
    return response


@app.post("/c_add_flag")
async def add_flag(data: models.C_Flag):
    response = await tasks.add_flag(data)
    return response


@app.post("/c_get_wishlist")
async def get_wishlist(data: models.C_GetWishlist):
    response = await tasks.get_wishlist(data)
    return response

@app.post("/c_edit_product")
async def edit_product(data: models.C_EditProduct):
    response = await tasks.edit_product(data)
    return response

@app.post("/get_username")
async def get_username(data: models.C_GetUsername):
    response = await tasks.get_username(data)
    return response

@app.post("/c_delete_user")
async def delete_user(data: models.C_DeleteUser):
    response = await tasks.delete_user(data)
    return response

@app.post("/c_follow_product")
async def product_follow(data: models.C_ProductFollow):
    response = await tasks.product_follow(data)
    return response


@app.post("/c_get_followed_products")
async def get_followed_products(data: models.C_GetFollowedProducts):
    response = await tasks.get_followed_products(data)
    return response

@app.post("/c_unfollow_product")
async def product_unfollow(data: models.C_ProductUnfollow):
    response = await tasks.product_unfollow(data)
    return response

@app.post("/c_add_profile")
async def c_add_profile(data: models.addProfile):
    response = await tasks.c_add_profile(data)
    return response

@app.post("/get_wishlist")
async def get_wishlist(data: models.getWishList):
    response = await tasks.get_wishlist(data)
    return response


@app.post("/remove_from_wishlist")
async def remove_from_wishlist(data: models.removeFromWishList):
    response = await tasks.remove_from_wishlist(data)
    return response

@app.post("/get_user_reviews")
async def get_user_reviews(data: models.C_GetUserReviews):
    response = await tasks.get_user_reviews(data)
    return response

@app.post("/fetch_flags")
async def fetch_flags(data: models.C_FetchFlags):
    response = await tasks.fetch_flags(data)
    return response

@app.post("/get_shop_details")
async def get_shop_details(data: models.C_ShopDetails):
    response = await tasks.get_shop_details(data)
    return response

# ================ SELLER ==================

@app.post("/s_register")
async def register(person: models.S_RegisterRequest):
    response = await tasks.register_seller(person)
    return response

@app.post("/s_verify_otp")
async def s_verify_otp(data: models.S_OTPVerification):
    response = await tasks.s_verify_otp(data)
    return response

@app.post("/s_login")
async def login(data: models.S_LoginRequest):
    response = await tasks.login_seller(data)
    return response

@app.post("/s_add_profile")
async def s_add_profile(data: models.addProfile):
    response = await tasks.s_add_profile(data)
    return response

@app.post("/shopDetails")
async def shop_details(data: models.S_ShopDetails):
    response = await tasks.shop_details(data)
    return response

@app.post("/s_get_username")
async def s_get_username(data: models.C_GetUsername):
    response = await tasks.s_get_username(data)
    return response

@app.post("/s_get_profile")
async def s_get_profile(data: models.C_GetProfile):
    response = await tasks.s_get_profile(data)
    return response