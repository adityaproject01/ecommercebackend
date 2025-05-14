import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import adminSubCatCss from "./adminSubCategory.module.css";
import axios from "axios";
const AdminSubCategory = () => {
  const navigate = useNavigate();
  const [isSubCatEditOpen, setIsSubCatEditOpen] = useState(false);
  const [isSetOpen, setIsSetOpen] = useState(false);
  const [name, setName] = useState("");
  const [subCatId, setSubCatId] = useState("");
  const [categoryMain, setCategoryMain] = useState("");
  const [images, setImages] = useState("");
  const token = localStorage.getItem("token");
  const [getSubCategoryDetails, setSubGetCategoryDetails] = useState([]);
  const [getCategoryDetails, setGetCategoryDetails] = useState([]);
  const [subCatEditName, setSubCatEditName] = useState();
  const [subCatEditImg, setSubCatEditImg] = useState();
  const [catGetName, setCatGetName] = useState();
  const [editCategoryId, setEditCategoryId] = useState("");
  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/subcategories"
      );
      const responseCat = await axios.get(
        "http://localhost:5000/api/category",
        {
          headers: { Authorization: token },
        }
      );
      setGetCategoryDetails(responseCat.data);

      setSubGetCategoryDetails(response.data);
    } catch (error) {
      console.log("Fetch category error", error);
    }
  };
  useEffect(() => {
    fetchSubCategories();
  }, [token]);
  //add subcat
  const handleSubCatDetails = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category_id", categoryMain);
    formData.append("image", images);

    try {
      await axios.post(
        "http://localhost:5000/api/subcategories/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      alert("Product added successfull");
      fetchSubCategories();
      closeModal();
    } catch (error) {
      console.log("error", error);
    }
  };

  // subcat edit
  const handleEditSubCat = async () => {
    const finalCategoryId =
      editCategoryId ||
      getCategoryDetails.find((cat) => cat.name === catGetName)?.id;

    const catId = parseInt(finalCategoryId);
    const formData = new FormData();
    formData.append("name", subCatEditName);
    formData.append("category_id", catId);
    if (subCatEditImg) {
      formData.append("image", subCatEditImg);
    }
    const subCatIdNum = parseInt(subCatId);
    try {
      await axios.put(
        `http://localhost:5000/api/subcategories/${subCatIdNum}`,
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
      console.log(catId, subCatEditName, catId, subCatIdNum);
      console.log(typeof (catId, subCatEditName, catId, subCatIdNum));
      console.log("catEditError", error);
    }
  };

  const handleEditClick = (id) => {
    const subCat = getSubCategoryDetails.find(
      (item) => item.subcategory_id === id
    );
    if (subCat) {
      setSubCatId(id);
      setSubCatEditName(subCat.subcategory_name);
      setCatGetName(subCat.category_name);
      setSubCatEditImg(null);
      setIsSubCatEditOpen(true);
    }
  };
  // delete

  const handleDeleteCat = async (subCatDelId) => {
    const catDelIdNum = parseInt(subCatDelId);
    try {
      await axios.delete(
        `http://localhost:5000/api/subcategories/${catDelIdNum}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      fetchSubCategories();
      // setSuCategoryDetails(res.data);
    } catch (error) {
      console.log("error delete category", error);
    }
  };
  const closeModal = () => {
    setIsSetOpen(false);
    setName("");
    setCategoryMain("");
    setImages("");
  };
  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/home");
  };

  return (
    <div className={adminSubCatCss.adminContainer}>
      <div className={adminSubCatCss.glassNavbar}>
        <button
          className={adminSubCatCss.navBtn}
          onClick={() => navigate("/admin")}
        >
          Home{" "}
        </button>
        <div className={adminSubCatCss.navTitle}>Welcome, Admin</div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className={`${adminSubCatCss.navBtn} ${adminSubCatCss.addBtn}`}
            onClick={() => setIsSetOpen(true)}
          >
            AddSubCategory
          </button>
          <button
            onClick={logoutButton}
            className={`${adminSubCatCss.navBtn} ${adminSubCatCss.logout}`}
          >
            🔓 Logout
          </button>
        </div>
      </div>
      <h2 className={adminSubCatCss.glassHeader}>Manage Sub-Categories</h2>

      <Outlet />
      {isSetOpen ? (
        <div className={adminSubCatCss.modalBackdrop}>
          <div
            className={`${adminSubCatCss.modalContainer} ${adminSubCatCss.glassCard}`}
          >
            <h3>Edit Sub Category</h3>

            <form onSubmit={handleSubCatDetails}>
              <label>Name</label>
              <input
                type="text"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />

              <label>Category</label>
              <select onChange={(e) => setCategoryMain(e.target.value)}>
                <option selected disabled>
                  Select Category
                </option>
                {getCategoryDetails.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <label></label>
              <input
                onChange={(e) => {
                  setImages(e.target.files[0]);
                }}
                type="file"
              />

              <button type="submit" className={adminSubCatCss.saveBtn}>
                submit
              </button>
              <button
              type="button"
                className={adminSubCatCss.cancelBtn}
                onClick={() => {
                  setIsSetOpen(false);
                }}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      ) : (
        <></>
      )}

      <div
        className={`${adminSubCatCss.tableHeader} ${adminSubCatCss.glassRow}`}
      >
        <div>ID</div>
        <div>SubName</div>
        <div>Image</div>
        <div>Actions</div>
      </div>
      {/* ftchsubcat */}
      {getSubCategoryDetails.map((item, index) => (
        <div className={adminSubCatCss.glassRow} key={index}>
          <div>{index + 1}</div>
          <div>{item.subcategory_name}</div>
          <div>
            <img
              src={item.image_url}
              alt="loading"
              className={adminSubCatCss.rowImage}
            />
          </div>
          <div className={adminSubCatCss.catActions}>
            <button
              onClick={() => handleEditClick(item.subcategory_id)}
              className={adminSubCatCss.editBtn}
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteCat(item.subcategory_id)}
              className={adminSubCatCss.deleteBtn}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {isSubCatEditOpen && (
        <div className={adminSubCatCss.modalBackdrop}>
          <div
            className={`${adminSubCatCss.modalContainer} ${adminSubCatCss.glassCard}`}
          >
            <h3>Edit Category</h3>
            <form
              onSubmit={(e) => {
                handleEditSubCat();
                e.preventDefault();
              }}
            >
              <label> Category Name:</label>
              <select onChange={(e) => setEditCategoryId(e.target.value)}>
                <option selected disabled>
                  {catGetName}
                </option>
                {getCategoryDetails.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <label>Sub Category Name:</label>
              <input
                type="text"
                value={subCatEditName}
                onChange={(e) => setSubCatEditName(e.target.value)}
              />
              <label>New Image (optional):</label>
              <input
                type="file"
                onChange={(e) => setSubCatEditImg(e.target.files[0])}
              />
              <div className={adminSubCatCss.modalActions}>
                <button type="submit" className={adminSubCatCss.saveBtn}>
                  Save
                </button>
                <button
                  type="button"
                  className={adminSubCatCss.cancelBtn}
                  onClick={() => {
                    setIsSubCatEditOpen(false);
                  }}
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

export default AdminSubCategory;
