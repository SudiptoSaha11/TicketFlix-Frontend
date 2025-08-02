import React, { useState, useEffect } from "react";
import Navbar from "../Admin/Navbar";
import axios from "axios";
import "./Booking.css"

const Booking = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get("https://ticketflix-backend.onrender.com/booking");
      setData(response.data);
      console.log("Fetched data:", response.data); // Debugging output
    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteBooking = async (id) => {
    try {
      await axios.patch(`https://ticketflix-backend.onrender.com/booking/${id}/cancel`);
      fetchData(); // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting booking:", error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="Booking">
      <Navbar />

      <div className="table-container-booking">
        <table className="table-booking">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Movie Name</th>
              <th>Seats Booked</th>
              <th>Total Amount</th>
              <th>Booking Date</th>
              <th>Booking Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item._id}>
                  <td>{item.userEmail}</td>
                  <td>{item.Name}</td>
                  <td>
                    {item.seats && item.seats.length > 0
                      ? item.seats.join(", ") // Convert array to comma-separated string
                      : "No seats booked"}
                  </td>
                  <td>₹{item.totalAmount}</td>
                  <td>{new Date(item.bookingDate).toLocaleDateString()}</td>
                  <td>{item.status}</td>
                  <td>
                    <button className="delete" onClick={() => deleteBooking(item._id)}>
                      Cancel Booking
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No bookings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Booking;
