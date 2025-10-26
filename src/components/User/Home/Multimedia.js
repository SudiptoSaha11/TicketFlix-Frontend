// src/components/Multimedia.js

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Usernavbar from "./Usernavbar";
import Footer from "./Footer";
import api from "../../../Utils/api";

const Multimedia = () => {
  const { trailerLink: rawTrailerLink, movieName } = useLocation().state || {};
  const [embedUrl, setEmbedUrl] = useState("");

  useEffect(() => {
    if (!rawTrailerLink) return;
    let url = rawTrailerLink.trim();

    if (url.includes("youtu.be")) {
      url = url.split("?")[0].replace(
        "https://youtu.be/",
        "https://www.youtube.com/embed/"
      );
    } else if (url.includes("watch?v=")) {
      url = url.split("&")[0].replace("watch?v=", "embed/");
    }

    setEmbedUrl(url);
  }, [rawTrailerLink]);

  return (
    <>
      <Usernavbar searchTerm="" setSearchTerm={() => {}} />

      <div className="px-4 pt-[100px] pb-8 text-[#17202a]">
        <h1 className="text-xl font-semibold text-center mb-4">
          {movieName || "Movie Trailer"}
        </h1>

        <div className="bg-white rounded-lg shadow overflow-hidden max-w-md mx-auto">
          {embedUrl ? (
            <div className="relative" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={embedUrl}
                title="YouTube video player"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No trailer available.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Multimedia;