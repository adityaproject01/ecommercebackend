import React from "react";
import viewCss from "./view.module.css";
import axios from "axios";
import { useNavigate, } from "react-router-dom";

const ViewMore = ({ ViewMoreDetails }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  async function handleAddCart(product) {
    const cartGetItem = {
      product_id: product.id,
      quantity: 1,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/cart/add",
        cartGetItem,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      console.log("Cart Add Response:", response.data);
      navigate("/home/cart");
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error.message);
    }
  }

  return (
    <div className={viewCss.pageWrapper}>
      
      <header className={viewCss.header}>
        <h1 className={viewCss.title}>Product Details</h1>
        <button className={viewCss.logoutBtn} onClick={logoutButton}>Logout</button>
      </header>

      <section className={viewCss.productPanel}>
        <div className={viewCss.imageWrapper}>
          <img
            src={ViewMoreDetails.image_url}
            alt={ViewMoreDetails.name}
            className={viewCss.productImage}
          />
        </div>

        <div className={viewCss.infoWrapper}>
          <h2 className={viewCss.productName}>{ViewMoreDetails.name}</h2>
          <p className={viewCss.description}>{ViewMoreDetails.description}</p>
          <p className={viewCss.price}>Price {ViewMoreDetails.price}</p>
          <button
            className={viewCss.cartButton}
            onClick={() => handleAddCart(ViewMoreDetails)}
          >
            Add to Cart
          </button>
        </div>
      </section>
    </div>
  );
};

export default ViewMore;
