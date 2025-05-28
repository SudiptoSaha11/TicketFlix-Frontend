import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Usernavbar from "./Usernavbar"; // If you have a shared navbar component

// Import the CSS file
import "./ReviewForm.css";

function ReviewForm() {
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [reviewText, setReviewText] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Grab the movieId passed via navigate("/reviewForm", { state: { movieId: id } })
  const { movieId } = location.state || {};

  // If movieId is missing, you can handle or redirect
  if (!movieId) {
    navigate("/");
    return null;
  }

  // Handle form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!reviewRating) {
      alert("Please select a rating.");
      return;
    }

    try {
      // POST the review to the server
      const response = await axios.post(
        `https://ticketflix-backend.onrender.com/movieview/review/${movieId}`,
        {
          rating: parseInt(reviewRating, 10),
          review: reviewText,
          user: reviewerName.trim() || "Anonymous",
        }
      );

      // Update local storage if needed
      const localKey = "moviereviews_" + movieId;
      localStorage.setItem(localKey, JSON.stringify(response.data.reviews));

      // Clear the form
      setReviewerName("");
      setReviewRating("");
      setReviewText("");

      // Navigate back to Moviedetails (or anywhere you want)
      navigate("/moviedetails");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    }
  };

  return (
    <>
      <Usernavbar />

      <div className="form-container">
        <h2>Submit Your Review</h2>
        <form onSubmit={handleReviewSubmit}>
          <div className="form-group">
            <label htmlFor="reviewerName">Your Name</label>
            <input
              id="reviewerName"
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rating">Rating⭐ (0-10)</label>
            <select
              id="rating"
              value={reviewRating}
              onChange={(e) => setReviewRating(e.target.value)}
            >
              <option value="">Select rating</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="review">Review</label>
            <textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows="4"
              placeholder="Share your thoughts about the movie"
            />
          </div>

          <button type="submit" className="submit-button">
            Submit Review
          </button>
        </form>
      </div>
    </>
  );
}

export default ReviewForm;
