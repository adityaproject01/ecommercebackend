import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import adminSubSubCatCss from "./adminSubSubCategory.module.css";
import axios from "axios";

const AdminSubSubCategory = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [isSubCatEditOpen, setIsSubCatEditOpen] = useState(false);
  const [isSetOpen, setIsSetOpen] = useState(false);

  const [name, setName] = useState("");
  const [images, setImages] = useState(null);
  const [categoryMain, setCategoryMain] = useState("");
  const [subcategoryId, setSubCategoryId] = useState("");

  const [getCategoryDetails, setGetCategoryDetails] = useState([]);
  const [getSubCategoryDetails, setSubGetCategoryDetails] = useState([]);
  const [getSubSubCategoryDetails, setSubSubGetCategoryDetails] = useState([]);
  const [subCatSelRes, setSubCatSelRes] = useState([]);

  const [subSubCatId, setSubSubCatId] = useState("");
  const [subSubCatEditName, setSubSubCatEditName] = useState("");
  const [subCatEditImg, setSubCatEditImg] = useState(null);
  const [editSubCatId, setEditSubCatId] = useState("");

  const fetchSubCategories = async () => {
    try {
      const [subSubRes, subCatRes, catRes] = await Promise.all([
        axios.get("http://localhost:5000/api/subsubcategory"),
        axios.get("http://localhost:5000/api/subcategories"),
        axios.get("http://localhost:5000/api/category", {
          headers: { Authorization: token },
        }),
      ]);
      setSubSubGetCategoryDetails(subSubRes.data);
      setSubGetCategoryDetails(subCatRes.data);
      setGetCategoryDetails(catRes.data);
    } catch (error) {
      console.log("Fetch category error", error);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, [token]);

  useEffect(() => {
    if (categoryMain) handleSeletedSub(categoryMain);
  }, [categoryMain]);

  const handleSeletedSub = async (categoryId) => {
    try {
      const id = parseInt(categoryId);
      const res = await axios.get(
        `http://localhost:5000/api/subcategories/category/${id}`,
        {
          headers: { Authorization: token },
        }
      );
      setSubCatSelRes(res.data);
    } catch (error) {
      console.log("Subcategory fetch error", error);
    }
  };

  const handleSubSubCatDetails = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", images);
    formData.append("subcategory_id", parseInt(subcategoryId));

    try {
      await axios.post("http://localhost:5000/api/subsubcategory/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      });
      alert("Sub-sub-category added successfully");
      fetchSubCategories();
      closeModal();
    } catch (error) {
      console.log("Error adding sub-sub-category", error);
    }
  };

  const handleEditClick = (subCatId, subSubCatId) => {
    const subCat = getSubCategoryDetails.find(sc => sc.subcategory_id === subCatId);
    const subSubCat = getSubSubCategoryDetails.find(ssc => ssc.subsub_id === subSubCatId);

    if (subCat && subSubCat) {
      setEditSubCatId(subCat.subcategory_id);
      setSubSubCatId(subSubCat.subsub_id);
      setSubSubCatEditName(subSubCat.subsub_name);
      setIsSubCatEditOpen(true);
    }
  };

  const handleEditSubCat = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", subSubCatEditName);
    formData.append("subcategory_id", editSubCatId);
    if (subCatEditImg) {
      formData.append("image", subCatEditImg);
    }

    try {
      await axios.put(
        `http://localhost:5000/api/subsubcategory/${subSubCatId}`,
        formData,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      fetchSubCategories();
      setIsSubCatEditOpen(false);
    } catch (error) {
      console.log("Edit error", error);
    }
  };

  const handleDeleteCat = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/subcategories/${id}`, {
        headers: { Authorization: token },
      });
      fetchSubCategories();
    } catch (error) {
      console.log("Delete error", error);
    }
  };

  const closeModal = () => {
    setIsSetOpen(false);
    setName("");
    setCategoryMain("");
    setSubCategoryId("");
    setImages(null);
  };

  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/home");
  };

  return (
    <div className={adminSubSubCatCss.adminContainer}>
      {/* Navbar */}
      <div className={adminSubSubCatCss.glassNavbar}>
        <button className={adminSubSubCatCss.navBtn} onClick={() => navigate("/admin")}>
          Home
        </button>
        <div className={adminSubSubCatCss.navTitle}>Welcome, Admin</div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className={`${adminSubSubCatCss.navBtn} ${adminSubSubCatCss.addBtn}`}
            onClick={() => setIsSetOpen(true)}
          >
            AddSubSubCategory
          </button>
          <button
            onClick={logoutButton}
            className={`${adminSubSubCatCss.navBtn} ${adminSubSubCatCss.logout}`}
          >
            🔓 Logout
          </button>
        </div>
      </div>

      <h2 className={adminSubSubCatCss.glassHeader}>Manage Sub-Sub-Categories</h2>
      <Outlet />

      {/* Add Modal */}
      {isSetOpen && (
        <div className={adminSubSubCatCss.modalBackdrop}>
          <div className={`${adminSubSubCatCss.modalContainer} ${adminSubSubCatCss.glassCard}`}>
            <h3>Add Sub Sub Category</h3>
            <form onSubmit={handleSubSubCatDetails}>
              <label>Name</label>
              <input type="text" onChange={(e) => setName(e.target.value)} />

              <label>Category</label>
              <select onChange={(e) => setCategoryMain(e.target.value)} defaultValue="">
                <option disabled value="">
                  Select Category
                </option>
                {getCategoryDetails.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <label>SubCategory</label>
              <select onChange={(e) => setSubCategoryId(e.target.value)} defaultValue="">
                <option disabled value="">
                  Select Sub Category
                </option>
                {subCatSelRes.map((sub) => (
                  <option key={sub.subcategory_id} value={sub.subcategory_id}>
                    {sub.subcategory_name}
                  </option>
                ))}
              </select>

              <label>Image</label>
              <input type="file" onChange={(e) => setImages(e.target.files[0])} />

              <button type="submit" className={adminSubSubCatCss.saveBtn}>
                Submit
              </button>
              <button type="button" className={adminSubSubCatCss.cancelBtn} onClick={closeModal}>
                Close
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`${adminSubSubCatCss.tableHeader} ${adminSubSubCatCss.glassRow}`}>
        <div>ID</div>
        <div>SubName</div>
        <div>Image</div>
        <div>Actions</div>
      </div>
      {getSubSubCategoryDetails.map((item, index) => (
        <div key={index} className={adminSubSubCatCss.glassRow}>
          <div>{index + 1}</div>
          <div>{item.subsub_name}</div>
          <div>
            <img
              src={`http://localhost:5000${item.image_url}`}
              alt="subsub"
              className={adminSubSubCatCss.rowImage}
            />
          </div>
          <div className={adminSubSubCatCss.catActions}>
            <button
              onClick={() => handleEditClick(item.subcategory_id, item.subsub_id)}
              className={adminSubSubCatCss.editBtn}
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteCat(item.subcategory_id)}
              className={adminSubSubCatCss.deleteBtn}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {isSubCatEditOpen && (
        <div className={adminSubSubCatCss.modalBackdrop}>
          <div className={`${adminSubSubCatCss.modalContainer} ${adminSubSubCatCss.glassCard}`}>
            <h3>Edit Sub-SubCategory</h3>
            <form onSubmit={handleEditSubCat}>
              <label>Sub-Sub Category Name:</label>
              <input
                type="text"
                value={subSubCatEditName}
                onChange={(e) => setSubSubCatEditName(e.target.value)}
              />
              <label>New Image (optional):</label>
              <input type="file" onChange={(e) => setSubCatEditImg(e.target.files[0])} />
              <div className={adminSubSubCatCss.modalActions}>
                <button type="submit" className={adminSubSubCatCss.saveBtn}>
                  Save
                </button>
                <button
                  type="button"
                  className={adminSubSubCatCss.cancelBtn}
                  onClick={() => setIsSubCatEditOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubSubCategory;
