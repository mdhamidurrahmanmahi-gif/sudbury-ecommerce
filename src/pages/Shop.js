import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../AuthForm";
import MyAccount from "../MyAccount";
import { supabase } from "../supabase";

function Shop({
  products,
  productsLoading,
  productsError,
  selectedCategory,
setSelectedCategory,
  addToCart,
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
     accountOpen,
  setAccountOpen,
  checkoutOpen,
  setCheckoutOpen,
  setCheckoutAfterLogin,
  setAuthOpen,
  handlePlaceOrder,
  setCheckoutItems,
  placingOrder,
  authOpen,
  authMode,
  setCurrentUser,
  checkoutAfterLogin,

}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="website">
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
{accountOpen && currentUser && (
  <MyAccount
    user={currentUser}
    onClose={() => setAccountOpen(false)}
  />
)}
     <header className="shop-navbar">
  <a href="/" className="shop-logo">
    SUDBURY<span>.</span>
  </a>
  <button
  className="shop-hamburger"
  onClick={() => setMenuOpen(!menuOpen)}
  aria-label="Toggle navigation menu"
  aria-expanded={menuOpen}
>
  {menuOpen ? "✕" : "☰"}
</button>
  <nav className={`shop-nav-links ${menuOpen ? "shop-menu-open" : ""}`}>
    <a href="/">Home</a>
    <a href="/shop">Shop</a>

  </nav>

  <div className={`shop-nav-actions ${menuOpen ? "shop-menu-open" : ""}`}>
    <button
      className="shop-wishlist-button"
      onClick={() => setSelectedCategory("My Wishlist")}
      aria-label="My Wishlist"
    >
      ♡ Wishlist
      {wishlist.length > 0 && ` (${wishlist.length})`}
    </button>

    <button
      className="shop-cart-button"
      onClick={() => setCartOpen(!cartOpen)}
    >
      🛒 Cart ({cartCount}) — ${Number(cartTotal).toFixed(2)}
    </button>
        <button
      className="shop-account-button"
      onClick={() => {
        if (currentUser) {
          setAccountOpen(true);
        } else {
          setAuthOpen(true);
        }
      }}
    >
      👤 My Account
    </button>
    {currentUser && (
  <button
    className="shop-signout-button"
    onClick={async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        alert("Sign Out failed. Please try again.");
      } else {
        setCurrentUser(null);
        setSelectedCategory("All Products");
setMenuOpen(false);
        setAccountOpen(false);
        setAuthOpen(false);
      }
    }}
  >
    Sign Out
  </button>
)}
  </div>
</header>
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
}
    else {
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
      <section id="shop" className="products-section">
        <div className="section-heading">
          <h1>SUDBURY Shop</h1>
          <p>Discover More. Shop Better.</p>
        </div>

        <div className="products-grid">
          {productsLoading ? (
            <p className="products-message">Loading products...</p>
          ) : productsError ? (
            <p className="products-message">{productsError}</p>
          ) : !products || products.length === 0 ? (
            <p className="products-message">No products found.</p>
          ) : (
            products.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="product-image">
                  <img
  src={product.image}
  alt={product.name}
  onClick={() => navigate(`/product/${product.id}`)}
  style={{ cursor: "pointer" }}
/>

                  <span className="product-badge">
                    {product.badge}
                  </span>

                  <button
                    className={
                      wishlist.includes(product.id)
                        ? "wishlist-button liked"
                        : "wishlist-button"
                    }
                    onClick={() => toggleWishlist(product.id)}
                  >
                    {wishlist.includes(product.id) ? "♥" : "♡"}
                  </button>
                </div>

                <div className="product-info">
                  <h3
  onClick={() => navigate(`/product/${product.id}`)}
  style={{ cursor: "pointer" }}
>
  {product.name}
</h3>

                 <p className="product-price">
  ${Number(product.price).toFixed(2)}
</p>

                  <button
                    className="add-to-cart-button"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Shop;