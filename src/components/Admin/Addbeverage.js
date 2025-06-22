// src/Admin/AddBeverage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Admin/Movie.css";

const AddBeverage = () => {
  const navigate = useNavigate();
  const [beverageName, setBeverageName] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState([{ label: "Small", price: "" }]);

  const sizeOptions = ["Small", "Medium", "Large", "Regular", "XL", "Custom"];

  const handleSizeChange = (idx, field, value) => {
    const newSizes = sizes.map((s, i) =>
      i === idx ? { ...s, [field]: field === "price" ? Number(value) : value } : s
    );
    setSizes(newSizes);
  };

  const addSizeRow = () => {
    setSizes([...sizes, { label: "Small", price: "" }]);
  };

  const removeSizeRow = (idx) => {
    setSizes(sizes.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://ticketflix-backend.onrender.com/beverages/add", {
        beverageName,
        image,
        category,
        sizes
      });
      // clear form
      setBeverageName("");
      setImage("");
      setCategory("");
      setSizes([{ label: "Small", price: "" }]);
      navigate("/beverages");
    } catch (err) {
      console.error("Add beverage error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="Movie_body">
      <form
        className="form_class_movie"
        style={{ margin: "5rem" }}
        onSubmit={handleSubmit}
      >
        <h2 className="Label_movie">Add Beverage</h2>

        <div className="mb-4">
          <label className="Label_movie">Beverage Name</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Beverage Name"
            value={beverageName}
            onChange={(e) => setBeverageName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Image URL</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
          />
          {image && <img src={image} alt="Preview" width="100" style={{ marginTop: "0.5rem" }} />}
        </div>

        <div className="mb-4">
          <label className="Label_movie">Category</label>
          <select
            className="form-control_movie"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Category
            </option>
            <option>Soft Drink</option>
            <option>Juice</option>
            <option>Water</option>
            <option>Coffee</option>
            <option>Tea</option>
            <option>Snack Combo</option>
            <option>Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="Label_movie">Sizes & Prices</label>
          {sizes.map((s, idx) => (
            <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <select
                className="form-control_movie"
                value={s.label}
                onChange={(e) => handleSizeChange(idx, "label", e.target.value)}
                required
              >
                {sizeOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
              <input
                type="number"
                className="form-control_movie"
                placeholder="Price"
                value={s.price}
                min="0"
                step="0.01"
                onChange={(e) => handleSizeChange(idx, "price", e.target.value)}
                required
              />
              {sizes.length > 1 && (
                <button type="button" onClick={() => removeSizeRow(idx)}>
                  &times;
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSizeRow}>
            + Add Size
          </button>
        </div>

        <div className="Submit">
          <button className="Movie_Button" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBeverage;