import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import sellerCss from "./seller.module.css"; // import CSS module

import axios from "axios";
import editImg from "../../images/banner/edit-button_7124470.png";
import deleteImg from "../../images/banner/delete1.png";

const Seller = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productDetails, setProductDetails] = useState([]);
  const [getCategoryDetails, setGetCategoryDetails] = useState([]);
  const [getSubCategoryDetails, setGetSubCategoryDetails] = useState([]);
  const [getSubSubCategoryDetails, setGetSubSubCategoryDetails] = useState([]);
  const [getSubSubSubCategoryDetails, setGetSubSubSubCategoryDetails] = useState([]);
  const totalOrders = productDetails.length;
  const totalQuantity = productDetails.reduce((sum, item) => sum + Number(item.quantity), 0);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSubCategory, setProductSubCategory] = useState("");
  const [productSubSubCategory, setProductSubSubCategory] = useState("");
  const [productSubSubSubCategory, setProductSubSubSubCategory] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [productDescription, setProductDescription] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (productCategory) fetchSubCategories(productCategory);
    else setGetSubCategoryDetails([]);
  }, [productCategory]);

  useEffect(() => {
    if (productSubCategory) fetchSubSubCategories(productSubCategory);
    else setGetSubSubCategoryDetails([]);
  }, [productSubCategory]);

  useEffect(() => {
    if (productSubSubCategory) fetchSubSubSubCategories(productSubSubCategory);
    else setGetSubSubSubCategoryDetails([]);
  }, [productSubSubCategory]);

  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/home");
  };

  const fetchProducts = () => {
    axios
      .get("http://localhost:5000/api/products/my-products", {
        headers: { Authorization: token },
      })
      .then((res) => setProductDetails(res.data.products))
      .catch((err) => console.log("Fetch my-products error", err));
  };

  const fetchCategories = () => {
    axios
      .get("http://localhost:5000/api/category")
      .then((res) => setGetCategoryDetails(res.data))
      .catch((err) => console.log("Fetch category error", err));
  };

  const fetchSubCategories = (categoryId) => {
    axios
      .get(`http://localhost:5000/api/subcategories/category/${categoryId}`)
      .then((res) => setGetSubCategoryDetails(res.data))
      .catch((err) => {
        console.error("Failed to fetch subcategories", err);
        setGetSubCategoryDetails([]);
      });
  };

  const fetchSubSubCategories = (subcategoryId) => {
    axios
      .get(`http://localhost:5000/api/subsubcategory/subcategory/${subcategoryId}`)
      .then((res) => setGetSubSubCategoryDetails(res.data))
      .catch((err) => {
        console.error("Failed to fetch sub-subcategories", err);
        setGetSubSubCategoryDetails([]);
      });
  };

  const fetchSubSubSubCategories = (subSubcategoryId) => {
    axios
      .get(`http://localhost:5000/api/subsubsubcategory/subsubcategory/${subSubcategoryId}`)
      .then((res) => setGetSubSubSubCategoryDetails(res.data))
      .catch((err) => {
        console.error("Failed to fetch sub-sub-subcategories", err);
        setGetSubSubSubCategoryDetails([]);
      });
  };

  const productDelete = (productId) => {
    axios
      .delete(`http://localhost:5000/api/products/${productId}`, {
        headers: { Authorization: token },
      })
      .then(() => fetchProducts())
      .catch((err) => console.log("DeleteError", err));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productSubSubSubCategory) {
      alert("Please select a SubSubSubCategory.");
      return;
    }

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", productPrice);
    formData.append("quantity", productQuantity);
    formData.append("sub_sub_subcategory_id", productSubSubSubCategory);
    formData.append("description", productDescription);
    formData.append("image", productImage);

    try {
      await axios.post("http://localhost:5000/api/products/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      });
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handlEditProduct = async (e, productId) => {
    e.preventDefault();
    if (!productSubSubSubCategory) {
      alert("Please select a SubSubSubCategory.");
      return;
    }

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", productPrice);
    formData.append("quantity", productQuantity);
    formData.append("sub_sub_subcategory_id", productSubSubSubCategory);
    formData.append("description", productDescription);
    if (productImage) formData.append("image", productImage);

    try {
      await axios.put(`http://localhost:5000/api/products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      });
      fetchProducts();
      closeModal();
    } catch (error) {
      console.log("errorEdit", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentEditId(null);
    setProductName("");
    setProductPrice("");
    setProductQuantity("");
    setProductCategory("");
    setProductSubCategory("");
    setProductSubSubCategory("");
    setProductSubSubSubCategory("");
    setProductImage(null);
    setProductDescription("");
  };

  return (
    <div className={sellerCss.seller}>
      <div className={sellerCss.sellerNav}>
        <button onClick={() => navigate("/seller/product")}>Product</button>
        <button onClick={() => setIsModalOpen(true)}>Add Product</button>
        <button onClick={logoutButton}>Logout</button>
      </div>

      <div className={sellerCss.sellerBody}>
        <div className={sellerCss.sellerSubBody}>
          <Outlet />

          {isModalOpen && (
            <div className={sellerCss.overlay}>
              <div className={sellerCss.modal}>
                <div className={sellerCss.modalNav}>
                  <h2>{isEditing ? "Edit Product" : "Add Product"}</h2>
                  <button onClick={closeModal}>Close</button>
                </div>
                <div className={sellerCss.productForm}>
                  <form onSubmit={(e) => isEditing ? handlEditProduct(e, currentEditId) : handleAddProduct(e)}>
                    <div className={sellerCss.productField}>
                      <label>Name</label>
                      <input value={productName} onChange={(e) => setProductName(e.target.value)} />
                    </div>
                    <div className={sellerCss.productField}>
                      <label>Price</label>
                      <input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
                    </div>
                    <div className={sellerCss.productField}>
                      <label>Quantity</label>
                      <input type="number" value={productQuantity} onChange={(e) => setProductQuantity(e.target.value)} />
                    </div>
                    <div className={sellerCss.productField}>
                      <label>Category</label>
                      <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                        <option value="">Select Category</option>
                        {getCategoryDetails.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className={sellerCss.productField}>
                      <label>SubCategory</label>
                      <select value={productSubCategory} onChange={(e) => setProductSubCategory(e.target.value)}>
                        <option value="">Select SubCategory</option>
                        {getSubCategoryDetails.map((sub) => (
                          <option key={sub.subcategory_id} value={sub.subcategory_id}>{sub.subcategory_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className={sellerCss.productField}>
                      <label>SubSubCategory</label>
                      <select value={productSubSubCategory} onChange={(e) => setProductSubSubCategory(e.target.value)}>
                        <option value="">Select SubSubCategory</option>
                        {getSubSubCategoryDetails.map((sub) => (
                          <option key={sub.subsub_id} value={sub.subsub_id}>{sub.subsub_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className={sellerCss.productField}>
                      <label>SubSubSubCategory</label>
                      <select value={productSubSubSubCategory} onChange={(e) => setProductSubSubSubCategory(e.target.value)}>
                        <option value="">Select SubSubSubCategory</option>
                        {getSubSubSubCategoryDetails.map((sub) => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className={sellerCss.productField}>
                      <label>Image</label>
                      <input type="file" onChange={(e) => setProductImage(e.target.files[0])} />
                    </div>
                    <div className={sellerCss.productField}>
                      <label>Description</label>
                      <input value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
                    </div>
                    <div className={sellerCss.productField}>
                      <button type="submit">{isEditing ? "Update" : "Submit"}</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
<div className={sellerCss.glassCardSummary}>
  <h2>Dashboard Summary</h2>
  <div className={sellerCss.statsGrid}>
    <div className={sellerCss.statBox}>
      <h3>Total Orders</h3>
      <p>{totalOrders}</p>
    </div>
    <div className={sellerCss.statBox}>
      <h3>Total Quantity</h3>
      <p>{totalQuantity}</p>
    </div>
    <div className={sellerCss.statBox}>
      <h3>Welcome Back!</h3>
      <p>Check your latest inventory updates below.</p>
    </div>
  </div>
</div>

          <div className={sellerCss.sellerGlassCard}>
            <div className={sellerCss.product}>
              <div className={sellerCss.productDetails}>SlNo</div>
              <div className={sellerCss.productDetails}>Name</div>
              <div className={sellerCss.productDetails}>Price</div>
              <div className={sellerCss.productDetails}>Quantity</div>
              <div className={sellerCss.productDetails}>Image</div>
              <div className={sellerCss.productDetails}>Description</div>
              <div className={sellerCss.productDetails}>Actions</div>
            </div>

            {productDetails.map((product, index) => (
              <div className={sellerCss.product} key={index}>
                <p className={sellerCss.productDetails}>{index + 1}</p>
                <p className={sellerCss.productDetails}>{product.name}</p>
                <p className={sellerCss.productDetails}>{product.price}</p>
                <p className={sellerCss.productDetails}>{product.quantity}</p>
                <p className={sellerCss.productDetails}>
                  <img src={product.image_url} alt="product" height="50" />
                </p>
                <p className={sellerCss.productDetailsDescription}>{product.description}</p>
                <p className={sellerCss.productDetails}>
                  <button className={sellerCss.actionButton} onClick={() => { setIsModalOpen(true); setIsEditing(true); setCurrentEditId(product.id); }}>
                    <img src={editImg} alt="edit" />
                  </button>
                  <button className={sellerCss.actionButton} onClick={() => productDelete(product.id)}>
                    <img src={deleteImg} alt="delete" />
                  </button>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seller;
