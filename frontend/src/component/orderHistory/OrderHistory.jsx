import React, { useEffect, useState } from "react";
import axios from "axios";
import oderHisCss from "./OrderHistory.module.css";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
const navigate=useNavigate()
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/order-history",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        setTimeout(() => {
          const fetchedOrders = response.data;
          setOrders(fetchedOrders);
          setRole(fetchedOrders[0]?.role || "customer");
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.log("Error fetching order history:", error);
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (loading) {
    return <p className={oderHisCss.loading}>Loading your orders...</p>;
  }

  return (
    <div className={oderHisCss.containerOdermain}>
      <div className={oderHisCss.containerOder}>
        <h2 className={oderHisCss.heading}>
          🧾 Order History <span className={oderHisCss.role}>({role})</span>
        </h2>

        {orders.length === 0 ? (
          <p className={oderHisCss.noOrders}>No orders found.</p>
        ) : (
          <div className={oderHisCss.orderList}>
            {orders.map((order, index) => (
              <div key={index} className={oderHisCss.orderCard}>
                <p>
                  <strong>Order ID:</strong> {order.id}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={oderHisCss.status}>{order.status}</span>
                </p>
                <p>
                  <strong>Total:</strong> ₹{order.total}
                </p>
                {role === "customer" && order.address_id && (
                  <p>
                    <strong>Shipping Address ID:</strong> {order.address_id}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        <div className={oderHisCss.buttonContainer}>
          <button onClick={()=>{navigate("/home")}} className={oderHisCss.bottomButton}>
            🛍️ Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
