import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import adminSubSubCatCss from "./adminSubSubCategory.module.css";
import axios from "axios";

const AdminSubSubSubCategory = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subSubCategoryId, setSubSubCategoryId] = useState("");

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [subSubSubCategories, setSubSubSubCategories] = useState([]);

  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editParentId, setEditParentId] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (categoryId) fetchSubCategories(categoryId);
  }, [categoryId]);

  useEffect(() => {
    if (subCategoryId) fetchSubSubCategories(subCategoryId);
  }, [subCategoryId]);

  const fetchAll = async () => {
    try {
      const [sssRes, ssRes, sRes, cRes] = await Promise.all([
        axios.get("http://localhost:5000/api/subsubsubcategory"),
        axios.get("http://localhost:5000/api/subsubcategory"),
        axios.get("http://localhost:5000/api/subcategories"),
        axios.get("http://localhost:5000/api/category", {
          headers: { Authorization: token },
        }),
      ]);
      setSubSubSubCategories(sssRes.data);
      setSubSubCategories(ssRes.data);
      setSubCategories(sRes.data);
      setCategories(cRes.data);
    } catch (error) {
      console.log("Fetch error", error);
    }
  };

  const fetchSubCategories = async (catId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/subcategories/category/${catId}`,
        {
          headers: { Authorization: token },
        }
      );
      setSubCategories(res.data);
    } catch (err) {
      console.log("SubCategory fetch error", err);
    }
  };

  const fetchSubSubCategories = async (subCatId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/subsubcategory/subcategory/${subCatId}`,
        {
          headers: { Authorization: token },
        }
      );
      setSubSubCategories(res.data);
    } catch (err) {
      console.log("SubSubCategory fetch error", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    console.log("c")
    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", image);
    formData.append("sub_subcategory_id", subSubCategoryId); // ✅ FIXED

    try {
      await axios.post(
        "http://localhost:5000/api/subsubsubcategory/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      alert("Sub-sub-sub-category added successfully");
      fetchAll();
      closeModal();
    } catch (error) {
      console.log("Add error", error.response?.data || error.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("sub_subcategory_id", editParentId);
    if (editImage) formData.append("image", editImage);

    try {
      await axios.put(
        `http://localhost:5000/api/subsubsubcategory/${editId}`,
        formData,
        {
          headers: { Authorization: token },
        }
      );
      fetchAll();
      setIsEditOpen(false);
    } catch (err) {
      console.log("Edit error", err.response?.data || err.message);
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditParentId(item.sub_subcategory_id);
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/subsubsubcategory/${id}`, {
        headers: { Authorization: token },
      });
      fetchAll();
    } catch (error) {
      console.log("Delete error", error);
    }
  };

  const closeModal = () => {
    setIsAddOpen(false);
    setName("");
    setImage(null);
    setCategoryId("");
    setSubCategoryId("");
    setSubSubCategoryId("");
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/home");
  };

  return (
    <div className={adminSubSubCatCss.adminContainer}>
      {/* Navbar */}
      <div className={adminSubSubCatCss.glassNavbar}>
        <button
          onClick={() => navigate("/admin")}
          className={adminSubSubCatCss.navBtn}
        >
          Home
        </button>
        <div className={adminSubSubCatCss.navTitle}>Sub-Sub-Sub-Categories</div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => setIsAddOpen(true)}
            className={`${adminSubSubCatCss.navBtn} ${adminSubSubCatCss.addBtn}`}
          >
            Add
          </button>
          <button
            onClick={logout}
            className={`${adminSubSubCatCss.navBtn} ${adminSubSubCatCss.logout}`}
          >
            🔓 Logout
          </button>
        </div>
      </div>

      <h2 className={adminSubSubCatCss.glassHeader}>
        Manage Sub-Sub-Sub-Categories
      </h2>
      <Outlet />

      {/* Add Modal */}
      {isAddOpen && (
        <div className={adminSubSubCatCss.modalBackdrop }>
          <div className={`${adminSubSubCatCss.modalContainer} ${adminSubSubCatCss.glassCard}`}>
            <h3>Add Sub-Sub-Sub-Category</h3>
            <form onSubmit={handleAdd}>
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

              <label>Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => (<>
                  console.log(cat)
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                </>
                ))}
              </select>

              <label>SubCategory</label>
              <select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)}>
                <option value="" disabled>Select SubCategory</option>
                {subCategories.map((sub) => (
                  <option key={sub.subcategory_id} value={sub.subcategory_id}>
                    {sub.subcategory_name}
                  </option>
                ))}
              </select>

              <label>SubSubCategory</label>
              <select value={subSubCategoryId} onChange={(e) => setSubSubCategoryId(e.target.value)}>
                <option value="" disabled>Select SubSubCategory</option>
                {subSubCategories.map((ss) => (
                  <option key={ss.subsub_id} value={ss.subsub_id}>
                    {ss.subsub_name}
                  </option>
                ))}
              </select>

              <label>Image</label>
              <input type="file" onChange={(e) => setImage(e.target.files[0])} />

              <button type="submit" className={adminSubSubCatCss.saveBtn}>Submit</button>
              <button type="button" onClick={closeModal} className={adminSubSubCatCss.cancelBtn}>
                Close
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`${adminSubSubCatCss.tableHeader} ${adminSubSubCatCss.glassRow}`}>
        <div>ID</div>
        <div>Name</div>
        <div>Image</div>
        <div>Actions</div>
      </div>
      {subSubSubCategories.map((item, index) => (
        <div key={index} className={adminSubSubCatCss.glassRow}>
          <div>{index + 1}</div>
          <div>{item.name}</div>
          <div>
            <img
              src={`http://localhost:5000${item.image_url}`}
              alt="subsubsub"
              className={adminSubSubCatCss.rowImage}
            />
          </div>
          <div className={adminSubSubCatCss.catActions}>
            <button onClick={() => handleEditClick(item)} className={adminSubSubCatCss.editBtn}>
              Edit
            </button>
            <button onClick={() => handleDelete(item.id)} className={adminSubSubCatCss.deleteBtn}>
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className={adminSubSubCatCss.modalBackdrop}>
          <div className={`${adminSubSubCatCss.modalContainer} ${adminSubSubCatCss.glassCard}`}>
            <h3>Edit Sub-Sub-Sub-Category</h3>
            <form onSubmit={handleEdit}>
              <label>Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <label>New Image (optional)</label>
              <input type="file" onChange={(e) => setEditImage(e.target.files[0])} />
              <button type="submit" className={adminSubSubCatCss.saveBtn}>Save</button>
              <button type="button" onClick={() => setIsEditOpen(false)} className={adminSubSubCatCss.cancelBtn}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubSubSubCategory;
