import React from "react";
import AuthForm from "../AuthForm";

function ProductDetails({
  product,
  productsLoading,
  addToCart,
    handleBuyNow,
  wishlist,
  toggleWishlist,
  cart,
  cartCount,
  cartTotal,
  cartOpen,
  setCartOpen,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  currentUser,
  setCheckoutOpen,
  setCheckoutItems,
  setCheckoutAfterLogin,
  setAuthOpen,
    checkoutOpen,
  handlePlaceOrder,
  placingOrder,
  authOpen,
  authMode,
  setCurrentUser,
  checkoutAfterLogin,
}) {
    if (productsLoading) {
  return <h2>Loading product...</h2>;
}

if (!product) {
  return <h2>Product not found.</h2>;
}

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="product-details-page">
        {checkoutOpen && currentUser && (
  <div className="checkout-overlay">
    <div className="checkout-panel">
      <h2>Checkout</h2>
      <p>Complete your order details.</p>

      <form onSubmit={handlePlaceOrder}>
        <label>Full Name</label>
        <input
          type="text"
          name="customerName"
          placeholder="Enter your full name"
          required
        />

        <label>Phone Number</label>
        <input
          type="tel"
          name="phone"
          placeholder="Enter your phone number"
          required
        />

        <label>Shipping Address</label>
        <textarea
          name="address"
          placeholder="Enter your shipping address"
          required
        />

        <button type="submit" disabled={placingOrder}>
          {placingOrder ? "Placing Order..." : "Continue to Place Order →"}
        </button>
      </form>

      <button onClick={() => setCheckoutOpen(false)}>
        Close
      </button>
    </div>
  </div>
)}
{authOpen && (
  <AuthForm
    initialMode={authMode}
    onClose={() => {
      setAuthOpen(false);
      setCheckoutAfterLogin(false);
    }}
    onLoginSuccess={(user) => {
      setCurrentUser(user);
      setAuthOpen(false);

      if (checkoutAfterLogin) {
        setCheckoutOpen(true);
        setCheckoutAfterLogin(false);
      }
    }}
  />
)}
        {cartOpen && (
  <div className="cart-overlay">
    <div className="cart-panel">
      <h2>Your Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>

              <p>
                ${Number(item.price).toFixed(2)} × {item.quantity}
              </p>

              <button onClick={() => decreaseQuantity(item.id)}>
                −
              </button>

              <span> {item.quantity} </span>

              <button onClick={() => increaseQuantity(item.id)}>
                +
              </button>

              <button onClick={() => removeFromCart(item.id)}>
                Remove
              </button>
            </div>
          ))}

          <h3>Total: ${Number(cartTotal).toFixed(2)}</h3>

          <button
            className="checkout-button"
            onClick={() => {
              if (currentUser) {
  setCheckoutItems(null);
  setCheckoutAfterLogin(false);
  setCheckoutOpen(true);
     } else {
                setCheckoutAfterLogin(true);
                setCartOpen(false);
                setAuthOpen(true);
              }
            }}
          >
            Proceed to Checkout →
          </button>
        </>
      )}

      <button onClick={() => setCartOpen(false)}>
        Close Cart
      </button>
    </div>
  </div>
)}
        <nav className="product-details-nav">
  <button
    className="back-to-shop"
    onClick={() => window.history.back()}
  >
    ← Back to Shop
  </button>

  <h2>SUDBURY</h2>

<button
  className="details-cart-button"
  onClick={() => setCartOpen(true)}
>
  🛒 Cart ({cartCount})
</button>
</nav>
      <div className="product-details-container">
        <div className="product-details-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-details-info">
          <p className="product-details-label">SUDBURY EXCLUSIVE</p>

          <h1>{product.name}</h1>

          <p className="product-details-price">
            ${Number(product.price).toFixed(2)}
          </p>

          {product.oldPrice && (
            <p className="product-details-old-price">
              ${Number(product.oldPrice).toFixed(2)}
            </p>
          )}

          <p className="product-details-description">
            {product.description || "Discover quality and style with SUDBURY."}
          </p>

          <div className="product-details-actions">
            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>
            <button
  className="buy-now-button"
  onClick={() => handleBuyNow(product)}
>
  Buy Now →
</button>
            <button onClick={() => toggleWishlist(product.id)}>
              {isWishlisted ? "♥ Wishlisted" : "♡ Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;