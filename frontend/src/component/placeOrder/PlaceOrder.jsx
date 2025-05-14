import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import placeCss from "./PlaceOrder.module.css";

const PlaceOrder = () => {
  const { state } = useLocation();
  const cartItems = state?.cartItems || [];
  const [addresses, setAddresses] = useState([]);
  const [newAddresses, setNewAddresses] = useState([]);
  const [clearedCart, setClearedCart] = useState();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [city, setCity] = useState("");
  const [states, setStates] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const newAddress = {
    full_name: name,
    phone,
    address_line1: addr1,
    address_line2: addr2,
    city,
    state: states,
    postal_code: postal,
    country,
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/address", {
          headers: { Authorization: token },
        });
        setAddresses(response.data.addresses);
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    };

    fetchAddresses();
  }, [token, newAddresses]);

  const calculateTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addAddresses = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/address/add",
        newAddress,
        { headers: { Authorization: token } }
      );
      setNewAddresses(response.data.addresses);
    } catch (err) {
      console.error("Failed to add address", err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select an address before placing the order.");
      return;
    }

    const orderPayload = {
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      total_price: calculateTotal(),
      address_id: selectedAddressId,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/order/add",
        orderPayload,
        { headers: { Authorization: token } }
      );

      if (response.data.message === "Order placed successfully") {
        navigate(`/home/order-confirmation/${response.data.orderId}`);
        handleClearCart();
      }
    } catch (error) {
      console.error(error);

      alert("Error placing order");
    }
  };

  const handleNewAddress = (e) => {
    e.preventDefault();
    addAddresses();
  };

  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/address/${id}`, {
        headers: { Authorization: token },
      });
      setAddresses(addresses.filter((addr) => addr.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };
  const handleClearCart = async (id) => {
    try {
      await axios.delete("http://localhost:5000/api/cart/clear", {
        headers: { Authorization: token },
      });
      console.log("cleared cart");
    } catch (err) {
      console.error("cart Cleard failed", err);
    }
  };

  const handleEditAddress = (addr) => {
    setEditId(addr.id);
    setEditForm({ ...addr });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/address/${editId}`, editForm, {
        headers: { Authorization: token },
      });
      setEditId(null);
      setEditForm({});
      const res = await axios.get("http://localhost:5000/api/address", {
        headers: { Authorization: token },
      });
      setAddresses(res.data.addresses);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className={placeCss.container}>
      {cartItems.length === 0 ? (
        <p className={placeCss.empty}>No items found in cart.</p>
      ) : (
        <div className={placeCss.wrapper}>
          <section className={placeCss.sectionLeft}>
            <div className={placeCss.sectionSubLeft}>
              <h3 className={placeCss.subtitle}>Select Shipping Address</h3>
              <p>Add a New Address:</p>
              <form
                className={placeCss.addressForm}
                onSubmit={handleNewAddress}
              >
                <input
                  placeholder="Full Name"
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  placeholder="Phone"
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  placeholder="Address Line 1"
                  onChange={(e) => setAddr1(e.target.value)}
                />
                <input
                  placeholder="Address Line 2"
                  onChange={(e) => setAddr2(e.target.value)}
                />
                <input
                  placeholder="City"
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  placeholder="State"
                  onChange={(e) => setStates(e.target.value)}
                />
                <input
                  placeholder="Postal Code"
                  onChange={(e) => setPostal(e.target.value)}
                />
                <input
                  placeholder="Country"
                  onChange={(e) => setCountry(e.target.value)}
                />
                <button className={placeCss.button} type="submit">
                  Add Address
                </button>
              </form>

              <div className={placeCss.addressList}>
                {addresses.map((addr) => (
                  <div key={addr.id} className={placeCss.addressItem}>
                    {editId === addr.id ? (
                      <form
                        onSubmit={handleUpdateSubmit}
                        className={placeCss.addressForm}
                      >
                        <input
                          value={editForm.full_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              full_name: e.target.value,
                            })
                          }
                        />
                        <input
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                        />
                        <input
                          value={editForm.address_line1}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              address_line1: e.target.value,
                            })
                          }
                        />
                        <input
                          value={editForm.address_line2}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              address_line2: e.target.value,
                            })
                          }
                        />
                        <input
                          value={editForm.city}
                          onChange={(e) =>
                            setEditForm({ ...editForm, city: e.target.value })
                          }
                        />
                        <input
                          value={editForm.state}
                          onChange={(e) =>
                            setEditForm({ ...editForm, state: e.target.value })
                          }
                        />
                        <input
                          value={editForm.postal_code}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              postal_code: e.target.value,
                            })
                          }
                        />
                        <input
                          value={editForm.country}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              country: e.target.value,
                            })
                          }
                        />
                        <button type="submit" className={placeCss.button}>
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className={placeCss.button}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      // className={placeCss.addresses}
                      <>
                        <label>
                          <input
                            type="radio"
                            name="selectedAddress"
                            value={addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                          />
                          <span>
                            {addr.full_name}, {addr.phone}, {addr.address_line1}
                            , {addr.city}, {addr.state}, {addr.postal_code},{" "}
                            {addr.country}
                          </span>
                        </label>
                        <div className={placeCss.addressActions}>
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className={`${placeCss.button} ${placeCss.buttonEdit}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className={`${placeCss.button} ${placeCss.buttonDelete}`}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={placeCss.sectionRight}>
            <div className={placeCss.sectionSubRight}>
              <h3 className={placeCss.sectionTitle}>Cart Summary</h3>
              <div className={placeCss.cartContainer}>
                {cartItems.map((item, index) => (
                  <div key={index} className={placeCss.cartItem}>
                    <div className={placeCss.cartItemDetails}>
                      <p className={placeCss.itemName}>{item.name}</p>
                      <p className={placeCss.itemPrice}>
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className={placeCss.totalBox}>
                <h4>Total: ₹{calculateTotal()}</h4>
              </div>
              <button
                onClick={handlePlaceOrder}
                className={placeCss.placeOrderBtn}
              >
                Place Order
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
