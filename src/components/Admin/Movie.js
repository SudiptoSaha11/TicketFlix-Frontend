import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Admin/Movie.css";

const Movie = () => {
  const navigate = useNavigate();
  const [movieName, setMovieName] = useState('');
  const [image, setImage] = useState(''); // Now a URL string instead of a file
  const [movieGenre, setMovieGenre] = useState('');
  const [movieLanguage, setMovieLanguage] = useState('');
  const [movieDuration, setMovieDuration] = useState('');
  // Cast members with image URL
  const [castMembers, setCastMembers] = useState([{ name: "", image: "" }]);
  const [movieDescription, setMovieDescription] = useState('');
  const [movieReleasedate, setMovieReleasedate] = useState('');
  const [trailerLink, settrailerlink] = useState('');
  const [movieFormat, setMovieFormat] = useState('');

  // Handler for movie poster URL change
  const handleImageChange = (e) => {
    setImage(e.target.value);
  };

  // Handlers for cast members (now text input for URL)
  const handleCastMemberNameChange = (index, value) => {
    const newCastMembers = [...castMembers];
    newCastMembers[index].name = value;
    setCastMembers(newCastMembers);
  };

  const handleCastMemberImageChange = (index, value) => {
    const newCastMembers = [...castMembers];
    newCastMembers[index].image = value;
    setCastMembers(newCastMembers);
  };

  const addCastMember = () => {
    setCastMembers([...castMembers, { name: "", image: "" }]);
  };

  const handelSubmit = async (evet) => {
    evet.preventDefault();

    // Prepare cast data as an array of objects.
    // Since cast image is now a URL, we use the entered value.
    const castData = castMembers.map(member => ({
      name: member.name,
      image: member.image
    }));

    const formData = new FormData();
    formData.append('movieName', movieName);
    // Append the movie poster URL as text
    formData.append('image', image);
    formData.append('movieGenre', movieGenre);
    formData.append('movieLanguage', movieLanguage);
    formData.append('movieDuration', movieDuration);
    // Append the cast data as a JSON string.
    formData.append('movieCast', JSON.stringify(castData));
    formData.append('movieDescription', movieDescription);
    formData.append('movieReleasedate', movieReleasedate);
    formData.append('trailerLink', trailerLink);
    formData.append('movieFormat', movieFormat);

    // Debug: log all formData entries
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.post('http://localhost:5000/movieschema/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response);
      // Clear form fields
      setMovieName("");
      setImage("");
      setMovieGenre("");
      setMovieLanguage("");
      setMovieDuration("");
      setCastMembers([{ name: "", image: "" }]);
      setMovieDescription("");
      setMovieReleasedate("");
      settrailerlink("");
      setMovieFormat("");
      navigate("/movieview");
    } catch (err) {
      console.log("error", err);
      if (err.response && err.response.data) {
        console.log("Data", err.response.data.message);
        console.log("Status", err.response.status);
      } else {
        console.log("Error message:", err.message);
      }
    }
  };

  return (
    <div className="Movie_body">
      <form className="form_class_movie" style={{ margin: "5rem" }} onSubmit={handelSubmit}>
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
          <br />
        </div>

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
          {image && <img src={image} alt="Movie Poster" width="100" />}
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Movie Genre</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Movie Genre"
            value={movieGenre}
            onChange={(e) => setMovieGenre(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Language</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Language"
            value={movieLanguage}
            onChange={(e) => setMovieLanguage(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Duration</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Duration"
            value={movieDuration}
            onChange={(e) => setMovieDuration(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Cast Members</label>
          {castMembers.map((member, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Enter Cast Name"
                value={member.name}
                onChange={(e) => handleCastMemberNameChange(index, e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Enter Cast Image URL"
                value={member.image}
                onChange={(e) => handleCastMemberImageChange(index, e.target.value)}
              />
              {member.image && <img src={member.image} alt="Cast" width="100" />}
            </div>
          ))}
          <button type="button" onClick={addCastMember}>Add Cast Member</button>
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Description</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Description"
            value={movieDescription}
            onChange={(e) => setMovieDescription(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Releasedate</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Releasedate"
            value={movieReleasedate}
            onChange={(e) => setMovieReleasedate(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Trailer Link</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Trailer Link"
            value={trailerLink}
            onChange={(e) => settrailerlink(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Movie Format</label>
          <input
            type="text"
            className="form-control_movie"
            placeholder="Enter Movie Format"
            value={movieFormat}
            onChange={(e) => setMovieFormat(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="Submit">
          <button className="Movie_Button" type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default Movie;