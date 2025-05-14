import "./App.css";
import Home from "./component/home/Home";
import LoginPage from "./component/login/LoginPage";
import Seller from "./component/seller/Seller";
import ProtectedRoute from "./ProtectedRoute";
import Product from "./component/seller/SellerProduct";
import Register from "./component/register/Register";
import Admin from "./component/admin/Admin";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminCategory from "./component/admin/adminCategory/AdminCategory";
import AdminSubCategory from "./component/admin/adminSubCategory/AdminSubCategory";
import AdminSubSubCategory from "./component/admin/adminSubSubCategory/AdminSubSubCategory";
import ViewMore from "./component/viewMore/ViewMore";
import { useEffect, useState } from "react";
import Cart from "./component/cart/Cart";
import PlaceOrder from "./component/placeOrder/PlaceOrder";
import OrderConfirmation from "./component/orderConfirmation/OrderConfirmation";
import OrderHistory from "./component/orderHistory/OrderHistory";
import AdminSubSubSubCategory from "./component/admin/adminSubSubSubCategory/AdminSubSubSubCategory";
import axios from "axios";

function App() {
  const navigate = useNavigate();
  const [ViewMoreDetails, setViewMoreDetails] = useState([]);
  const [totalCartCount, setTotalCartCount] = useState(0);

  // Session expiry
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");

      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        alert("Session expired. Please log in again.");
        navigate("/");
      }
    }, 3600000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Fetch cart count on load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .get("http://localhost:5000/api/cart", {
          headers: { Authorization: token },
        })
        .then((res) => {
          setTotalCartCount(res.data.length || 0);
          console.log("Updated totalCartCount in App:", res.data.length);
        })
        .catch((err) => {
          console.error("Failed to fetch cart count in App:", err);
        });
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute
            element={
              <Home
                totalCartCount={totalCartCount}
                setViewMoreDetails={setViewMoreDetails}
              />
            }
            allowedRoles={["customer"]}
          />
        }
      />
      <Route
        path="/home/viewmore"
        element={
          <ProtectedRoute
            element={<ViewMore ViewMoreDetails={ViewMoreDetails} />}
            allowedRoles={["customer"]}
          />
        }
      />
      <Route
        path="/home/place-order"
        element={
          <ProtectedRoute
            element={<PlaceOrder />}
            allowedRoles={["customer"]}
          />
        }
        allowedRoles={["customer"]}
      />
      <Route
        path="/home/order-confirmation/:orderId"
        element={
          <ProtectedRoute
            element={<OrderConfirmation />}
            allowedRoles={["customer", "seller", "admin"]}
          />
        }
      />

      <Route
        path="/home/order-history"
        element={<OrderHistory />}
        allowedRoles={["customer", "seller", "admin"]}
      />
      <Route
        path="/home/cart"
        element={<Cart setTotalCartCount={setTotalCartCount} />}
        allowedRoles={["customer"]}
      />
      <Route
        path="/seller"
        element={
          <ProtectedRoute element={<Seller />} allowedRoles={["seller"]} />
        }
      />
      <Route
        path="/seller/product"
        element={
          <ProtectedRoute element={<Product />} allowedRoles={["seller"]} />
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute element={<Admin />} allowedRoles={["admin"]} />
        }
      />
      <Route
        path="/admin/admincategory"
        element={
          <ProtectedRoute
            element={<AdminCategory />}
            allowedRoles={["admin"]}
          />
        }
      />
      <Route
        path="/admin/adminsubcategory"
        element={
          <ProtectedRoute
            element={<AdminSubCategory />}
            allowedRoles={["admin"]}
          />
        }
      />
      <Route
        path="/admin/adminsubsubcategory"
        element={
          <ProtectedRoute
            element={<AdminSubSubCategory />}
            allowedRoles={["admin"]}
          />
        }
      />
      <Route
        path="/admin/adminsubsubsubcategory"
        element={
          <ProtectedRoute
            element={<AdminSubSubSubCategory />}
            allowedRoles={["admin"]}
          />
        }
      />
    </Routes>
  );
}

export default App;
