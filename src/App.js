import React, { useState, useEffect } from "react";
import ConnectionTest from "./ConnectionTest";
import AuthForm from "./AuthForm";
import MyAccount from "./MyAccount";
import { supabase } from "./supabase";
import "./App.css";




const categories = [
  "All Products",
  "Electronics",
  "Fashion",
  "Home & Living",
  "Sports",
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState(() => {
  try {
    const savedCart = localStorage.getItem("sudbury_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    return [];
  }
});
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
const [currentUser, setCurrentUser] = useState(null); 
const [products, setProducts] = useState([]);
const [productsLoading, setProductsLoading] = useState(true);
const [productsError, setProductsError] = useState("");
  useEffect(() => {
  localStorage.setItem("sudbury_cart", JSON.stringify(cart));
}, [cart]);
useEffect(() => {
  let active = true;

  async function loadWishlist() {
    if (!currentUser?.id) {
      setWishlist([]);
      return;
    }

    const { data, error } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", currentUser.id);

    if (!active) return;

    if (error) {
      console.error("Wishlist Load Error:", error.message);
      return;
    }

    setWishlist((data || []).map((item) => item.product_id));
  }

  loadWishlist();

  return () => {
    active = false;
  };
}, [currentUser?.id]);
useEffect(() => {
  let active = true;

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (!active) return;

    if (error) {
      console.error("Product Fetch Error:", error);
      setProductsError("Products could not be loaded. Please refresh.");
    } else {
      const formattedProducts = (data || []).map((product) => ({
        ...product,
        oldPrice: product.old_price,
        badge: "FEATURED",
        rating: 4.8,
      }));

      setProducts(formattedProducts);
    }

    setProductsLoading(false);
  }

  loadProducts();

  return () => {
    active = false;
  };
}, []);
useEffect(() => {
  let mounted = true;

  async function checkSession() {
    const { data, error } = await supabase.auth.getSession();

    if (!mounted) return;

    if (error) {
      console.error("Session Error:", error.message);
      return;
    }

    setCurrentUser(data.session?.user ?? null);
  }

  checkSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setCurrentUser(session?.user ?? null);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  const filteredProducts = products.filter((product) => {
  const categoryMatch =
  selectedCategory === "All Products" ||
  selectedCategory === "My Wishlist" ||
  product.category === selectedCategory;

  const searchMatch = product.name
    .toLowerCase()
    .includes(search.toLowerCase());

  const wishlistMatch =
    selectedCategory !== "My Wishlist" ||
    wishlist.includes(product.id);

  return categoryMatch && searchMatch && wishlistMatch;
}); 

  const addToCart = (product) => {
    setCart((previousCart) => {
      const existingProduct = previousCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return previousCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== id)
    );
  };
  const increaseQuantity = (id) => {
  setCart((previousCart) =>
    previousCart.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );
};

const decreaseQuantity = (id) => {
  setCart((previousCart) =>
    previousCart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

  const toggleWishlist = async (id) => {
  if (!currentUser) {
    alert("Please sign in to save your wishlist.");
    setAuthOpen(true);
    return;
  }

  const alreadySaved = wishlist.includes(id);

  if (alreadySaved) {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("product_id", id);

    if (error) {
      console.error("Wishlist Remove Error:", error.message);
      alert("Could not remove this product from your wishlist.");
      return;
    }

    setWishlist((previousWishlist) =>
      previousWishlist.filter((item) => item !== id)
    );
  } else {
    const { error } = await supabase
      .from("wishlist")
      .insert({
        user_id: currentUser.id,
        product_id: id,
      });

    if (error) {
      console.error("Wishlist Save Error:", error.message);
      alert("Could not save this product to your wishlist.");
      return;
    }

    setWishlist((previousWishlist) => [...previousWishlist, id]);
  }
};

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const [placingOrder, setPlacingOrder] = useState(false);
  const handlePlaceOrder = async (event) => {
  event.preventDefault();

  if (!currentUser || cart.length === 0) {
    alert("Please sign in and add products to your cart.");
    return;
  }

  setPlacingOrder(true);

  try {
    const form = event.currentTarget;
    const formData = new FormData(form);

    const customerName = formData.get("customerName");
    const phone = formData.get("phone");
    const address = formData.get("address");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: currentUser.id,
        customer_name: customerName,
        email: currentUser.email,
        phone: phone,
        shipping_address: address,
        total_amount: cartTotal,
        payment_method: "cod",
        payment_status: "unpaid",
        order_status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    alert("Order placed successfully!");

    setCart([]);
    setCheckoutOpen(false);
  } catch (error) {
    console.error("Order Error:", error);
    alert("Order failed: " + error.message);
  } finally {
    setPlacingOrder(false);
  }
};

  return (
    <div className="website">
       <ConnectionTest />
       {authOpen && (
  <AuthForm
    onClose={() => setAuthOpen(false)}
    onLoginSuccess={(user) => setCurrentUser(user)}
  />
)}
{accountOpen && currentUser && (
  <MyAccount
    user={currentUser}
    onClose={() => setAccountOpen(false)}
  />
)}
{checkoutOpen && currentUser && (
  <div className="checkout-overlay">
    <div className="checkout-panel">
      <h2>Checkout</h2>
      <p>Complete your order details.</p>
      <form onSubmit={handlePlaceOrder}>

  <label>Full Name</label>
  <input type="text" name="customerName" placeholder="Enter your full name" required />

  <label>Phone Number</label>
  <input type="tel" name="phone" placeholder="Enter your phone number" required />

  <label>Shipping Address</label>
  <textarea name="address" placeholder="Enter your shipping address" required />

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
      {/* Announcement Bar */}
      <div className="announcement">
        Complimentary shipping on orders over $150
        <span> — Discover the Sudbury experience</span>
      </div>

      {/* Navigation */}
      <header className="header">
        <div className="nav-container">
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          <a href="#home" className="logo">
            SUDBURY<span>.</span>
          </a>

          <nav className={menuOpen ? "nav-links active" : "nav-links"}>
            <a href="#home" onClick={() => setMenuOpen(false)}>
              Home
            </a>
            <a href="#shop" onClick={() => setMenuOpen(false)}>
              Shop
            </a>
            <a href="#categories" onClick={() => setMenuOpen(false)}>
              Categories
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>
          </nav>

          <div className="nav-actions">
            <button
  className="icon-button"
  aria-label="Wishlist"
  onClick={() => {
    setSelectedCategory("My Wishlist");

    document.getElementById("shop")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
              ♡
              {wishlist.length > 0 && (
                <span className="count">{wishlist.length}</span>
              )}
            </button>

            <button
              className="icon-button cart-icon"
              onClick={() => setCartOpen(true)}
              aria-label="Shopping cart"
            >
              🛒
              {cartCount > 0 && (
                <span className="count">{cartCount}</span>
              )}
            </button>

            {currentUser ? (
              <>
  <button
    className="account-button"
    onClick={async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout Error:", error.message);
        alert("Logout failed. Please try again.");
      } else {
        setCurrentUser(null);
        setAuthOpen(false);
      }
    }}
  >
        Logout
  </button>

  <button
    className="account-button"
    onClick={() => setAccountOpen(true)}
  >
    My Account
  </button>
  </>
) : (
  <button
    className="account-button"
    onClick={() => setAuthOpen(true)}
  >
    Sign In
  </button>
)}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-label">
            THE ART OF BETTER LIVING
          </div>

          <h1>
            Extraordinary
            <br />
            starts here<span>.</span>
          </h1>

          <p>
            Discover a thoughtfully curated collection of
            exceptional products, designed to elevate
            every moment of your everyday life.
          </p>

          <div className="hero-buttons">
            <a href="#shop" className="primary-button">
              Explore Collection <span>↗</span>
            </a>

            <a href="#about" className="secondary-button">
              Our Story →
            </a>
          </div>

          <div className="hero-bottom">
            <div>
              <strong>Premium</strong>
              <span>Quality Products</span>
            </div>

            <div>
              <strong>Curated</strong>
              <span>Collections</span>
            </div>

            <div>
              <strong>Secure</strong>
              <span>Shopping</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400"
            alt="Sudbury premium collection"
          />
          <div className="hero-image-label">
            <span>01 / THE COLLECTION</span>
            <strong>Redefine your everyday.</strong>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature">
          <span>✧</span>
          <div>
            <h3>Exceptional Quality</h3>
            <p>Carefully selected products</p>
          </div>
        </div>

        <div className="feature">
          <span>↗</span>
          <div>
            <h3>Fast Delivery</h3>
            <p>Reliable shipping experience</p>
          </div>
        </div>

        <div className="feature">
          <span>◇</span>
          <div>
            <h3>Secure Shopping</h3>
            <p>Shop with confidence</p>
          </div>
        </div>

        <div className="feature">
          <span>♡</span>
          <div>
            <h3>Customer First</h3>
            <p>Designed around you</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section" id="categories">
        <div className="section-heading">
          <div>
            <span className="section-label">EXPLORE SUDBURY</span>
            <h2>Shop by category<span>.</span></h2>
          </div>

          <p>
            Discover collections tailored to your lifestyle.
          </p>
        </div>

        <div className="category-grid">
          <a
            href="#shop"
            className="category-card electronics"
            onClick={() => setSelectedCategory("Electronics")}
          >
            <div>
              <span>01 / COLLECTION</span>
              <h3>Electronics</h3>
              <p>Explore technology →</p>
            </div>
          </a>

          <a
            href="#shop"
            className="category-card fashion"
            onClick={() => setSelectedCategory("Fashion")}
          >
            <div>
              <span>02 / COLLECTION</span>
              <h3>Fashion</h3>
              <p>Discover your style →</p>
            </div>
          </a>

          <a
            href="#shop"
            className="category-card living"
            onClick={() => setSelectedCategory("Home & Living")}
          >
            <div>
              <span>03 / COLLECTION</span>
              <h3>Home & Living</h3>
              <p>Elevate your space →</p>
            </div>
          </a>
        </div>
      </section>

      {/* Products */}
      <section className="products-section" id="shop">
        <div className="section-heading">
          <div>
            <span className="section-label">THE SUDBURY EDIT</span>
            <h2>Discover exceptional<span>.</span></h2>
          </div>

          <p>
            A curated selection of products worth discovering.
          </p>
        </div>

        <div className="shop-toolbar">
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={
                  selectedCategory === category
                    ? "filter-button selected"
                    : "filter-button"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <input
            className="search-input"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="products-grid">
  {productsLoading ? (
    <p className="products-message">Loading products...</p>
  ) : productsError ? (
    <p className="products-message">{productsError}</p>
  ) : filteredProducts.length === 0 ? (
    <p className="products-message">No products found.</p>
  ) : (
    filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image">
                <img src={product.image} alt={product.name} />

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

              <div className="product-information">
                <span className="product-category">
                  {product.category}
                </span>

                <h3>{product.name}</h3>

                <div className="rating">
                  ★ <span>{product.rating} / 5.0</span>
                </div>

                <div className="product-bottom">
                  <div className="product-price">
                    <strong>${product.price}</strong>
                    <del>${product.oldPrice}</del>
                  </div>

                  <button
                    className="add-button"
                    onClick={() => addToCart(product)}
                  >
                    Add +
                  </button>
                </div>
                            </div>
            </div>
          ))
        )}
        </div>

        
      </section>

      {/* About */}
      <section className="about-section" id="about">
        <span className="section-label">THE SUDBURY PHILOSOPHY</span>

        <h2>
          Less ordinary.
          <br />
          More extraordinary.
        </h2>

        <p>
          We believe great products should combine thoughtful
          design, exceptional quality, and effortless functionality.
          Sudbury brings together a carefully selected collection
          for those who appreciate the finer details.
        </p>

        <a href="#shop" className="primary-button">
          Discover Sudbury ↗
        </a>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <h2>SUDBURY<span>.</span></h2>
            <p>Discover More. Shop Better.</p>
          </div>

          <div className="footer-column">
            <h4>Explore</h4>
            <a href="#shop">Shop All</a>
            <a href="#categories">Categories</a>
            <a href="#about">Our Story</a>
          </div>

          <div className="footer-column">
            <h4>Customer Care</h4>
            <a href="#shop">Shipping</a>
            <a href="#shop">Returns</a>
            <a href="#shop">Contact</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Sudbury. All rights reserved.</p>
          <p>Crafted for the extraordinary.</p>
        </div>
      </footer>

      {/* Shopping Cart */}
      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="cart-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <h2>Your Bag ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)}>
                ✕
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <span>◇</span>
                  <h3>Your bag is empty</h3>
                  <p>Discover something extraordinary.</p>
                  <button
                    className="primary-button"
                    onClick={() => setCartOpen(false)}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div>
                      <h4>{item.name}</h4>
                      <div className="quantity-controls">
  <button onClick={() => decreaseQuantity(item.id)}>
    −
  </button>

  <span>{item.quantity}</span>

  <button onClick={() => increaseQuantity(item.id)}>
    +
  </button>
</div>
                      <strong>
                        ${item.price * item.quantity}
                      </strong>

                      <button
                        className="remove-button"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Subtotal</span>
                  <strong>${cartTotal.toFixed(2)}</strong>
                </div>

                <button
  className="checkout-button"
  onClick={() => setCheckoutOpen(true)}
>
                  Proceed to Checkout →
                </button>

                <p>Shipping calculated at checkout.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;