import React from "react";
import "./sellerProduct.css";
import { Outlet, useNavigate } from "react-router-dom";

const SellerProduct = () => {
  const navigate = useNavigate();
  return (
    <div className="sellerProduct">
      <div className="sellerProductNav">
        <button onClick={() => navigate("/seller")}>Products</button>
      </div>
      <div className="sellerProductBody">
        <div className="sellerSubCategoryBody">
          <Outlet />
          <div className="glass-card"></div>
          {/* <div className="glass-card">
            <h2>Add New Category</h2>
            <form>
              <label>
                Category Name
                <input
                  type="text"
                  placeholder="Enter Category Name"
                  required
                />
              </label>

              <label>
                Image URL
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  />
              </label>

              <div
                className="image-preview"
                id="previewContainer"
              >
                <img id="previewImage" src="" alt="Preview" />
              </div>

              <button className="sellerProductSubmit" type="submit">Submit Category</button>
            </form>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SellerProduct;
