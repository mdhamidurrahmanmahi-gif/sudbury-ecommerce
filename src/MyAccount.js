import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./MyAccount.css";

function MyAccount({ user, onClose }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);
const [ordersLoading, setOrdersLoading] = useState(true);
const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, address")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setMessage("Could not load your profile.");
      } else if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user?.id]);
  useEffect(() => {
  let active = true;

  async function loadOrders() {
    if (!user?.id) {
      setOrdersLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, total_amount, order_status, created_at, order_items(product_name, quantity, unit_price)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!active) return;

    if (error) {
      console.error("Orders Load Error:", error.message);
      setOrdersError("Could not load your orders.");
    } else {
      setOrders(data || []);
      setOrdersError("");
    }

    setOrdersLoading(false);
  }

  loadOrders();

  return () => {
    active = false;
  };
}, [user?.id]);


  async function saveProfile(event) {
    event.preventDefault();

    if (!user?.id || saving) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Profile Save Error:", error.message);
      setMessage("Save failed: " + error.message);
    } else {
      setMessage("Profile saved successfully!");
    }

    setSaving(false);
  }

  return (
    <div className="account-overlay" onClick={onClose}>
      <div
        className="account-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="account-header">
          <div>
            <span className="account-label">SUDBURY MEMBERSHIP</span>
            <h2>My Account<span>.</span></h2>
          </div>

          <button
            type="button"
            className="account-close"
            onClick={onClose}
            aria-label="Close account"
          >
            ✕
          </button>
        </div>

        <p className="account-description">
          Manage your personal details and shipping information.
        </p>
        <div className="my-orders-section">
  <h3>My Orders</h3>
  <p className="orders-subtitle">Your recent purchases</p>

  {ordersLoading ? (
    <p>Loading your orders...</p>
  ) : ordersError ? (
    <p>{ordersError}</p>
  ) : orders.length === 0 ? (
    <p>You haven't placed any orders yet.</p>
  ) : (
    <div className="orders-list">
      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <div className="order-card-header">
            <span>Order #{String(order.id).slice(0, 8)}</span>
            <span className="order-status">
              {order.order_status}
            </span>
          </div>

          <div className="order-products">
            {(order.order_items || []).map((item, index) => (
              <p key={index}>
                {item.product_name} × {item.quantity}
              </p>
            ))}
          </div>

          <div className="order-card-footer">
            <span>
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString()
                : ""}
            </span>
            <strong>
  {Number(order.total_amount || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })}
</strong>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

        {loading ? (
          <p>Loading your profile...</p>
        ) : (
          <form onSubmit={saveProfile} className="account-form">
            <label htmlFor="account-name">Full Name</label>
            <input
              id="account-name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              maxLength={100}
            />

            <label htmlFor="account-email">Email Address</label>
            <input
              id="account-email"
              type="email"
              value={user?.email || ""}
              disabled
            />

            <label htmlFor="account-phone">Phone Number</label>
            <input
              id="account-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter your phone number"
              maxLength={30}
            />

            <label htmlFor="account-address">Shipping Address</label>
            <textarea
              id="account-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter your shipping address"
              rows={4}
              maxLength={500}
            />

            <button
              type="submit"
              className="account-save"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile →"}
            </button>

            {message && (
              <p className="account-message" role="status">
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default MyAccount;