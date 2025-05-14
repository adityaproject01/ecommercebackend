import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import orderSucCss from "./orderSucCss.module.css";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
const navigate =useNavigate()
  const fetchOrderDetails = useCallback(async () => {
    try {
      const orderIdInt = parseInt(orderId);
      const response = await axios.get(
        `http://localhost:5000/api/order-confirmation/${orderIdInt}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data && response.data.order && response.data.items) {
        setOrder(response.data.order);
        setItems(response.data.items);
      } else {
        setError("Invalid response from server.");
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Failed to load order details.");
    }
  }, [orderId, token]);
  const handleGoToOrders = () => {
    navigate("/home/order-history", { replace: true });
  };
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home/order-history", { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) {
    return <div className={orderSucCss.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={orderSucCss.error}>{error}</div>;
  }

  if (!order) {
    return <div className={orderSucCss.error}>Order not found</div>;
  }

  return (
    <div className={orderSucCss.containerOrder}>
      <div className={orderSucCss.card}>
        <h2 className={orderSucCss.success}>✅ Order Placed Successfully!</h2>
        <h3 className={orderSucCss.subtitle}>Order ID: #{orderId}</h3>

        <div className={orderSucCss.productList}>
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} className={orderSucCss.productItem}>
                <p>
                  <strong>Product:</strong> {item.product_name}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p>
                  <strong>Price:</strong> ₹{item.price}
                </p>
              </div>
            ))
          ) : (
            <p>No products found in this order.</p>
          )}
        </div>

        <button onClick={handleGoToOrders} className={orderSucCss.link}>
          View My Orders
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
