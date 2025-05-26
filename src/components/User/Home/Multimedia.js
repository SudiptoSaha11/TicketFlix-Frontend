import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Multimedia.css";
import Usernavbar from "./Usernavbar"; // Adjust the path as needed
import Footer from "./Footer";

const Multimedia = () => {
  const location = useLocation();
  console.log("Location state:", location.state);

  // Destructure state with fallback values
  const { trailerLink: rawTrailerLink, movieName: passedMovieName } = location.state || {};

  const [embedUrl, setEmbedUrl] = useState("");

  useEffect(() => {
    if (!rawTrailerLink) return;

    let processedLink = rawTrailerLink.trim();

    // Handle short youtu.be links
    if (processedLink.includes("youtu.be")) {
      if (processedLink.includes("?")) {
        processedLink = processedLink.split("?")[0];
      }
      processedLink = processedLink.replace(
        "https://youtu.be/",
        "https://www.youtube.com/embed/"
      );
    }
    // Handle watch?v= links
    else if (processedLink.includes("watch?v=")) {
      if (processedLink.includes("&")) {
        processedLink = processedLink.split("&")[0];
      }
      processedLink = processedLink.replace("watch?v=", "embed/");
    }

    setEmbedUrl(processedLink);
  }, [rawTrailerLink]);

  return (
    <>
      {/* Include the navbar at the top */}
      <Usernavbar searchTerm={""} setSearchTerm={() => {}} />

      <div className="multimedia-page">
        <h1 className="movie-title">
          {passedMovieName || "Movie Trailer"}
        </h1>

        {/* Card-like container matching the screenshot style */}
        <div className="video-card">
          <div className="video-container">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <p>No trailer available.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Multimedia;
