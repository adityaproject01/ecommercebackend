import React, { useEffect, useState } from "react";
import homecss from "./home.module.css";
import AutoSlider from "./AutoSlider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import cartIocn from "../../images/banner/carticon1.png";
import profile from "../../images/banner/profile.png";

const Home = ({ setViewMoreDetails, totalCartCount }) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [subSubSubCategories, setSubSubSubCategories] = useState([]);
  const [showSubcategory, setShowSubcategory] = useState(false);
  const [showSubSubcategory, setShowSubSubcategory] = useState(false);
  const [showSubSubSubcategory, setShowSubSubSubcategory] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const navigate = useNavigate();
  const baseUrl = "http://localhost:5000";

  useEffect(() => {
    axios.get(`${baseUrl}/api/products/`).then((res) => {
      setProducts(res.data.products);
    });

    axios.get(`${baseUrl}/api/category`).then((res) => {
      setCategory(res.data);
    });
  }, [totalCartCount]);

  const handleCategoryClick = async (id) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/subcategories/category/${id}`
      );
      setSubCategories(res.data);
      setShowSubcategory(true);
      setShowSubSubcategory(false);
      setShowSubSubSubcategory(false);
      setFilteredProducts([]);
      setCurrentPage(1);
    } catch (err) {
      console.log("Subcategory fetch failed:", err);
    }
  };

  const handleSubCategoryClick = async (subCatId) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/subsubcategory/subcategory/${subCatId}`
      );
      setSubSubCategories(res.data);
      setShowSubSubcategory(true);
      setShowSubSubSubcategory(false);
      setFilteredProducts([]);
      setCurrentPage(1);
    } catch (err) {
      console.log("Sub-subcategory fetch failed:", err);
    }
  };

  const handleSubSubCategoryClick = async (subSubCatId) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/subsubsubcategory/subsubcategory/${subSubCatId}`
      );
      setSubSubSubCategories(res.data);
      setShowSubSubSubcategory(true);
      setFilteredProducts([]);
      setCurrentPage(1);
    } catch (err) {
      console.log("Sub-sub-subcategory fetch failed:", err);
    }
  };

  const handleSubSubSubCategoryClick = async (subSubSubCatId) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/products?sub_sub_subcategory=${subSubSubCatId}`
      );
      setFilteredProducts(res.data.products);
      setCurrentPage(1);
    } catch (err) {
      console.log("Product filter by sub-sub-subcategory failed:", err);
    }
  };

  const handleUserVm = (itemId) => {
    const selectedItem = [...products, ...filteredProducts].find(
      (product) => product.id === itemId
    );
    if (selectedItem) {
      setViewMoreDetails(selectedItem);
      navigate("/home/viewmore");
    }
  };

  const handleBackToCategories = () => {
    setShowSubcategory(false);
    setShowSubSubcategory(false);
    setShowSubSubSubcategory(false);
    setFilteredProducts([]);
    setCurrentPage(1);
  };

  const handleBackToSubcategories = () => {
    setShowSubSubcategory(false);
    setShowSubSubSubcategory(false);
    setFilteredProducts([]);
    setCurrentPage(1);
  };

  const handleBackToSubSubcategories = () => {
    setShowSubSubSubcategory(false);
    setFilteredProducts([]);
    setCurrentPage(1);
  };

  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/home");
  };

  const paginate = (items) => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const displayedProducts =
    filteredProducts.length > 0 ? filteredProducts : products;
  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);

  return (
    <div className={homecss.home}>
      <div className={homecss.homeBackground}>
        <div className={homecss.homeHeadderBody}>
          <div className={homecss.homeHeadder}>
            <div className={homecss.homeHeaderLeft}>
              <p>Welcome to online shopping</p>
            </div>
            <div className={homecss.homeHeaderRight}>
              <div className={homecss.cartImg}>
                <img onClick={() => navigate("/home/cart")} src={cartIocn} />
                <p className={homecss.cartCnt}>{totalCartCount}</p>
              </div>
              <img src={profile} width={"50px"} />
              <button className={homecss.Logout} onClick={logoutButton}>
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className={homecss.homeBanner}>
          <AutoSlider />
        </div>
        {/* Categories */}
        <div className={homecss.category}>
          <div className={homecss.subCategory}>
            {/* Top-level categories */}
            {!showSubcategory && (
              <div className={homecss.categoryContainer}>
                {category.map((item, index) => (
                  <div
                    onClick={() => handleCategoryClick(item.id)}
                    className={homecss.categoryCard}
                    key={index}
                  >
                    <img
                      src={item.image_url}
                      alt=""
                      className={homecss.categoryImage}
                    />
                    <p className={homecss.categoryDetails}>{item.name}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Subcategories */}
            {showSubcategory && !showSubSubcategory && (
              <div className={homecss.subCat}>
                <div className={homecss.categoryContainer}>
                  <button
                    className={homecss.backButton}
                    onClick={handleBackToCategories}
                  >
                    ← Back
                  </button>
                  {subCategories.map((item, index) => (
                    <div
                      onClick={() =>
                        handleSubCategoryClick(item.subcategory_id)
                      }
                      key={index}
                      className={homecss.categoryCard}
                    >
                      <img
                        src={item.image_url}
                        alt=""
                        className={homecss.categoryImage}
                      />
                      <p className={homecss.categoryDetails}>
                        {item.subcategory_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-subcategories */}
            {showSubSubcategory && !showSubSubSubcategory && (
              <div className={homecss.subCat}>
                <div className={homecss.categoryContainer}>
                  <button
                    className={homecss.backButton}
                    onClick={handleBackToSubcategories}
                  >
                    ← Back
                  </button>
                  {subSubCategories.length > 0 ? (
                    subSubCategories.map((item, index) => (
                      <div
                        key={index}
                        onClick={() =>
                          handleSubSubCategoryClick(item.subsub_id)
                        }
                        className={homecss.categoryCard}
                      >
                        <img
                          src={`${baseUrl}${item.image_url}`}
                          alt=""
                          className={homecss.categoryImage}
                        />
                        <p className={homecss.categoryDetails}>
                          {item.subsub_name}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No sub-subcategories found.</p>
                  )}
                </div>
              </div>
            )}

            {/* Sub-sub-subcategories */}
            {showSubSubSubcategory && (
              <div className={homecss.subCat}>
                <div className={homecss.categoryContainer}>
                  <button
                    className={homecss.backButton}
                    onClick={handleBackToSubSubcategories}
                  >
                    ← Back
                  </button>
                  {subSubSubCategories.length > 0 ? (
                    subSubSubCategories.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSubSubSubCategoryClick(item.id)}
                        className={homecss.categoryCard}
                      >
                        <img
                          src={`${baseUrl}${item.image_url}`}
                          alt={item.name}
                          className={homecss.categoryImage}
                        />
                        <p className={homecss.categoryDetails}>{item.name}</p>
                      </div>
                    ))
                  ) : (
                    <p>No sub-sub-subcategories found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Products */}
        <div className={homecss.products}>
          {paginate(displayedProducts).map((item, index) => (
            <div key={index} className={homecss.subProducts}>
              <div className={homecss.subProductImg}>
                <div className={homecss.productImageCard}>
                  <img
                    src={item.image_url}
                    alt=""
                    className={homecss.productImage}
                  />
                </div>
                <div className={homecss.productBlur}>
                  <p className={homecss.productDetailsName}>{item.name}</p>
                  <div className={homecss.productCardPrice}>
                    <b>
                      <p className={homecss.price}>Price {item.price}</p>
                    </b>
                    <button
                      className={homecss.viewMorebtn}
                      onClick={() => handleUserVm(item.id)}
                    >
                      ViewMore
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <nav aria-label="pagination">
          <ul className={homecss.pagination}>
            <li>
              <button
                className={homecss.paginationLink}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i}>
                <button
                  className={`${homecss.paginationLink} ${
                    currentPage === i + 1 ? homecss.activePage : ""
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                className={homecss.paginationLink}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Home;
