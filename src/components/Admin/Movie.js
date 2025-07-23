import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Admin/Movie.css";

const Movie = () => {
  const navigate = useNavigate();

  // Movie fields
  const [movieName, setMovieName] = useState("");
  const [image, setImage] = useState("");
  const [movieGenre, setMovieGenre] = useState("");
  const [movieLanguage, setMovieLanguage] = useState("");
  const [movieDuration, setMovieDuration] = useState("");
  const [movieCensor, setMovieCensor] = useState(""); // ← new field

  // Cast members
  const [castMembers, setCastMembers] = useState([{ name: "", image: "" }]);
  // Crew members
  const [crewMembers, setCrewMembers] = useState([{ name: "", role: "", image: "" }]);

  // Other fields
  const [movieDescription, setMovieDescription] = useState("");
  const [movieReleasedate, setMovieReleasedate] = useState("");
  const [trailerLink, setTrailerLink] = useState("");
  const [movieFormat, setMovieFormat] = useState("");

  // Handlers for simple inputs
  const handleImageChange = (e) => setImage(e.target.value);
  const handleCensorChange = (e) => setMovieCensor(e.target.value);

  // Cast handlers
  const handleCastNameChange = (index, value) => {
    const updated = [...castMembers];
    updated[index].name = value;
    setCastMembers(updated);
  };
  const handleCastImageChange = (index, value) => {
    const updated = [...castMembers];
    updated[index].image = value;
    setCastMembers(updated);
  };
  const addCastMember = () =>
    setCastMembers([...castMembers, { name: "", image: "" }]);

  // Crew handlers
  const handleCrewNameChange = (index, value) => {
    const updated = [...crewMembers];
    updated[index].name = value;
    setCrewMembers(updated);
  };
  const handleCrewRoleChange = (index, value) => {
    const updated = [...crewMembers];
    updated[index].role = value;
    setCrewMembers(updated);
  };
  const handleCrewImageChange = (index, value) => {
    const updated = [...crewMembers];
    updated[index].image = value;
    setCrewMembers(updated);
  };
  const addCrewMember = () =>
    setCrewMembers([...crewMembers, { name: "", role: "", image: "" }]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const castData = castMembers.map((m) => ({
      name: m.name,
      image: m.image,
    }));
    const crewData = crewMembers.map((m) => ({
      name: m.name,
      role: m.role,
      image: m.image,
    }));

    const formData = new FormData();
    formData.append("movieName", movieName);
    formData.append("image", image);
    formData.append("movieGenre", movieGenre);
    formData.append("movieLanguage", movieLanguage);
    formData.append("movieDuration", movieDuration);
    formData.append("movieCensor", movieCensor);           // ← append new field
    formData.append("movieCast", JSON.stringify(castData));
    formData.append("movieCrew", JSON.stringify(crewData));
    formData.append("movieDescription", movieDescription);
    formData.append("movieReleasedate", movieReleasedate);
    formData.append("trailerLink", trailerLink);
    formData.append("movieFormat", movieFormat);

    try {
      await axios.post(
        "https://ticketflix-backend.onrender.com/movieschema/add",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      // reset all fields
      setMovieName("");
      setImage("");
      setMovieGenre("");
      setMovieLanguage("");
      setMovieDuration("");
      setMovieCensor("");                             // ← reset new field
      setCastMembers([{ name: "", image: "" }]);
      setCrewMembers([{ name: "", role: "", image: "" }]);
      setMovieDescription("");
      setMovieReleasedate("");
      setTrailerLink("");
      setMovieFormat("");
      navigate("/movieview");
    } catch (err) {
      console.error(
        "Submission error:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div className="Movie_body">
      <form
        className="form_class_movie"
        style={{ margin: "5rem" }}
        onSubmit={handleSubmit}
      >
        {/* Movie Name */}
        <div className="mb-4">
          <label className="Label_movie">Enter Movie Name</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Movie Name"
            value={movieName}
            onChange={(e) => setMovieName(e.target.value)}
            required
          />
        </div>

        {/* Poster URL */}
        <div className="mb-4">
          <label className="Label_movie">Movie Poster URL</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Movie Poster URL"
            value={image}
            onChange={handleImageChange}
            required
          />
          {image && <img src={image} alt="Poster" width="100" />}
        </div>

        {/* Genre, Language, Duration, Censor */}
        <div className="mb-4">
          <label className="Label_movie">Movie Genre</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Movie Genre"
            value={movieGenre}
            onChange={(e) => setMovieGenre(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="Label_movie">Language</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Language"
            value={movieLanguage}
            onChange={(e) => setMovieLanguage(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="Label_movie">Duration</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Duration"
            value={movieDuration}
            onChange={(e) => setMovieDuration(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="Label_movie">Censor Rating</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Censor Rating"
            value={movieCensor}
            onChange={handleCensorChange}
            required
          />
        </div>

        {/* Cast Members */}
        <div className="mb-4">
          <label className="Label_movie">Cast Members</label>
          {castMembers.map((member, idx) => (
            <div key={idx} style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Cast Name"
                value={member.name}
                onChange={(e) =>
                  handleCastNameChange(idx, e.target.value)
                }
                required
              />
              <input
                type="text"
                placeholder="Cast Image URL"
                value={member.image}
                onChange={(e) =>
                  handleCastImageChange(idx, e.target.value)
                }
              />
              {member.image && (
                <img src={member.image} alt="Cast" width="100" />
              )}
            </div>
          ))}
          <button type="button" onClick={addCastMember}>
            Add Cast Member
          </button>
        </div>

        {/* Crew Members */}
        <div className="mb-4">
          <label className="Label_movie">Crew Members</label>
          {crewMembers.map((member, idx) => (
            <div key={idx} style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Crew Name"
                value={member.name}
                onChange={(e) =>
                  handleCrewNameChange(idx, e.target.value)
                }
                required
              />
              <input
                type="text"
                placeholder="Role"
                value={member.role}
                onChange={(e) =>
                  handleCrewRoleChange(idx, e.target.value)
                }
                required
              />
              <input
                type="text"
                placeholder="Crew Image URL"
                value={member.image}
                onChange={(e) =>
                  handleCrewImageChange(idx, e.target.value)
                }
              />
              {member.image && (
                <img src={member.image} alt="Crew" width="100" />
              )}
            </div>
          ))}
          <button type="button" onClick={addCrewMember}>
            Add Crew Member
          </button>
        </div>

        {/* Description, Release Date, Trailer, Format */}
        <div className="mb-4">
          <label className="Label_movie">Description</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Description"
            value={movieDescription}
            onChange={(e) => setMovieDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="Label_movie">Release Date</label>
          <input
            type="date"
            className="form-control_movie"
            value={movieReleasedate}
            onChange={(e) => setMovieReleasedate(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="Label_movie">Trailer Link</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Trailer Link"
            value={trailerLink}
            onChange={(e) => setTrailerLink(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="Label_movie">Movie Format</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Movie Format"
            value={movieFormat}
            onChange={(e) => setMovieFormat(e.target.value)}
            required
          />
        </div>

        {/* Submit */}
        <div className="Submit">
          <button className="Movie_Button" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Movie;