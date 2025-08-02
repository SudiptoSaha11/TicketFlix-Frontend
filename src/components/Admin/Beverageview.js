// src/Admin/Beverageview.js
import React, { useState, useEffect } from "react";
import Navbar from "../Admin/Navbar";
import axios from "axios";
import "../Admin/Movieview.css";
import { Link, useNavigate } from "react-router-dom";

const DETAIL_KEYS = [
  "id",
  "beveragename",
  "beverageimage",
  "category",
  "sizes"
];

const Beverageview = () => {
  const [data, setData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await axios.get("https://ticketflix-backend.onrender.com/beverages");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching beverages:", err);
    }
  };

  useEffect(() => {
    fetchData();

    if (!localStorage.getItem("isPopupShown")) {
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        localStorage.setItem("isPopupShown", "true");
      }, 3000);
    }
  }, []);

  const handleEditPrep = (b) => {
    // clear old keys
    DETAIL_KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem("id", b._id);
    localStorage.setItem("beveragename", b.beverageName);
    localStorage.setItem("beverageimage", b.image);
    localStorage.setItem("category", b.category);
    localStorage.setItem("sizes", JSON.stringify(b.sizes));
    navigate("/edit-beverage");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://ticketflix-backend.onrender.com/beverages/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting beverage:", err);
    }
  };

  return (
    <div className="movieview">
      <Navbar />

      {showPopup && (
        <div className="popup-container">
          <div className="popup">
            <h2>Welcome back, Admin!</h2>
            <button
              onClick={() => setShowPopup(false)}
              className="close-popup-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table1">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Sizes, Prices & Quantities</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((b) => (
              <tr key={b._id}>
                <td>
                  <img
                    className="table-imagesize"
                    src={b.image}
                    alt={b.beverageName}
                  />
                </td>
                <td>{b.beverageName}</td>
                <td>{b.category}</td>
                <td>
                  {b.sizes?.map((s, i) => (
                    <div key={i} className="cast-container-admin">
                      <span>
                        {s.label}: ₹{s.price} (Qty: {s.quantity})
                      </span>
                    </div>
                  ))}
                </td>
                <td>
                  <button
                    className="update"
                    onClick={() => handleEditPrep(b)}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    className="delete"
                    onClick={() => handleDelete(b._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="Add_button_container">
        <Link to="/addbeverage">
          <button className="Addbutton">Add Beverage</button>
        </Link>
      </div>
    </div>
  );
};

export default Beverageview;
