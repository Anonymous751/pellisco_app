Product Schema :

Product Schema Fields (Short List)

Basic Product Info
name — Product name
brand — Brand name (optional)
slug — SEO-friendly product URL
description — Product description
category — Product category
tags — Keywords for search/filter


Pricing
price.mrp — Maximum Retail Price
price.sale — Selling price


Product Variants
variants — Different product options
variants.size — Product size (100ml, 250ml etc.)
variants.color — Product color (if applicable)
variants.stock — Stock for that variant
variants.sku — Unique product code


Inventory
stock — Total stock (if no variants)


Shipping Info
weight — Product weight
dimensions.length — Package length
dimensions.width — Package width
dimensions.height — Package height


Product Media
images — Product images
images.public_id — Cloud image ID
images.url — Image URL


Product Details
ingredients — Product ingredients
usage — How to use the product


Ratings & Reviews
ratings — Average rating
numOfReviews — Total reviews
reviews — Customer reviews
reviews.user — User who wrote review
reviews.name — Reviewer name
reviews.rating — Rating given
reviews.comment — Review comment
reviews.createdAt — Review date


Product Control
isFeatured — Show on homepage
status — Product status (available/sold out/out_of_stock)


Admin Info
user — Admin who created product
createdAt — Product creation date
updatedAt — Last update date
-------------------------------------------------------------------------------------------------------
--------User Authentication System --------------------------------------:

1. Authentication APIs


// Register a new user account
POST /api/v1/auth/register

// Login user and generate JWT token
POST /api/v1/auth/login

// Logout user and clear authentication token
POST /api/v1/auth/logout

// Get currently logged-in user details
GET /api/v1/auth/me

// Send password reset link to user's email
POST /api/v1/auth/forgot-password

// Reset password using reset token
POST /api/v1/auth/reset-password/:token

// Allow logged-in user to update password
PUT /api/v1/auth/update-password

// Allow user to update profile information
PUT /api/v1/auth/update-profile


-----------------------------------------
2. User APIs

// Get logged-in user's profile information
GET /api/v1/users/profile

// Update user profile details
PUT /api/v1/users/profile

// Get all orders placed by the logged-in user
GET /api/v1/users/orders

--------------------------------------------------

3. Admin User Management APIs

// Get list of all users (admin only)
GET /api/v1/admin/users

// Get details of a specific user
GET /api/v1/admin/user/:id

// Update user role or account details
PUT /api/v1/admin/user/:id

// Delete a user account
DELETE /api/v1/admin/user/:id

----------------------------------------------------------

4. Product APIs

---> Public Product APIs

// Get all products with search, filter, sort, pagination
GET /api/v1/products

// Get single product by ID
GET /api/v1/products/:id

// Get product using SEO slug
GET /api/v1/products/slug/:slug



---> Admin Product APIs

// Create a new product (admin only)
POST /api/v1/admin/products

// Update existing product
PUT /api/v1/admin/products/:id

// Delete a product
DELETE /api/v1/admin/products/:id

// Get all products for admin dashboard
GET /api/v1/admin/products

-------------------------------------------------------

5. Product Review APIs

// Add a review to a product
POST /api/v1/reviews

// Get all reviews for a specific product
GET /api/v1/reviews/:productId

// Update an existing review
PUT /api/v1/reviews/:id

// Delete a review
DELETE /api/v1/reviews/:id

-----------------------------------------------------

6. Cart APIs

// Get current user's cart items
GET /api/v1/cart

// Add product to cart
POST /api/v1/cart/add

// Update quantity of a cart item
PUT /api/v1/cart/update/:itemId

// Remove specific item from cart
DELETE /api/v1/cart/remove/:itemId

// Clear entire cart
DELETE /api/v1/cart/clear

------------------------------------

7. Address APIs

// Add a new shipping address
POST /api/v1/address

// Get all addresses of the logged-in user
GET /api/v1/address

// Update a specific address
PUT /api/v1/address/:id

// Delete a specific address
DELETE /api/v1/address/:id

---------------------------------
8. Order APIs

---> User Order APIs

// Create a new order from cart
POST /api/v1/orders

// Get all orders of logged-in user
GET /api/v1/orders/my

// Get single order details
GET /api/v1/orders/:id



---> Admin Order APIs

// Get all orders in the system
GET /api/v1/admin/orders

// Update order status (processing, shipped, delivered)
PUT /api/v1/admin/orders/:id

// Delete an order
DELETE /api/v1/admin/orders/:id


-------------------------------------------

9. Payment APIs

// Create payment order with payment gateway
POST /api/v1/payment/create-order

// Verify payment after transaction
POST /api/v1/payment/verify

// Get payment details for a specific order
GET /api/v1/payment/:orderId


---------------------------------------------

10. Wishlist APIs (Optional Feature)


// Get all wishlist items of user
GET /api/v1/wishlist

// Add product to wishlist
POST /api/v1/wishlist

// Remove product from wishlist
DELETE /api/v1/wishlist/:productId

----------------------------------------

11. Coupon APIs (Optional)

// Create discount coupon (admin only)
POST /api/v1/admin/coupons

// Get all available coupons
GET /api/v1/coupons

// Delete coupon
DELETE /api/v1/admin/coupons/:id


----------------------------------

12. Admin Dashboard APIs

// Get dashboard statistics (sales, users, orders)
GET /api/v1/admin/dashboard

// Get sales analytics
GET /api/v1/admin/sales

// Get top selling products
GET /api/v1/admin/top-products


-------------------------------------------------------------------------------
API	Purpose
POST /register	Register user + send OTP
POST /verify-email	Verify email OTP
POST /login	Login after verification
GET /logout	Logout user


----------------------------------------------------------
Admin routes :

GET     /admin/users
GET     /admin/users/search
GET     /admin/user/:id
PATCH   /admin/user/:id
PATCH   /admin/user/:id/password
PATCH   /admin/user/:id/block
DELETE  /admin/user/:id
GET     /admin/user/:id/logs

-------------------------------------------------------------------------
