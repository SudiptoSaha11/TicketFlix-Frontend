import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../UIElements/LoadingSpinner';
import "../Admin/Login.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [errortxt, setErrortxt] = useState();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const inputHandler1 = (event) => {
    setEmail(event.target.value);
  };

  const inputHandler2 = (event) => {
    setPassword(event.target.value);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);

      const response = await axios.post('https://ticketflix-backend.onrender.com/adminlogin', {
        email,
        password
      });

      if (response.status === 200) {
        localStorage.setItem("usertype", "admin"); // Set admin type
        navigate("/dashboard");
      } else {
        setErrortxt(response.data.message);
      }
      setIsLoading(false);

    } catch (err) {
      setIsLoading(false);
      setErrortxt(err.response?.data?.message || 'Something went wrong, please try again.');
    }
    
    if (errortxt) handleShow();
  };

  return (
    <div className="Login_body">
      <section className="Login_section">
        <form onSubmit={authSubmitHandler}>
          <h1 className="loginclass">Admin sign in</h1>

          <div className="login_input_box">
            <ion-icon name="mail-outline"></ion-icon>
            <input
              className="login"
              type="email"
              value={email}
              onChange={inputHandler1}
              id="email"
              required
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="login_input_box">
            <ion-icon name="lock-closed-outline"></ion-icon>
            <input
              type="password"
              value={password}
              onChange={inputHandler2}
              id="password"
              required
            />
            <label htmlFor="password">Password</label>
          </div>

          <div className="forget">
            <label><input type="checkbox" /> Remember Me</label>
            <a href="#">Forget Password</a>
          </div>

          <button className="Button_login" type="submit">Sign in</button>
          <p className="mt-5 mb-3 text-muted">&copy; 2017–2021</p>
        </form>
      </section>

      {isLoading && <LoadingSpinner asOverlay />}

      <Modal className="error-message-alert" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Error Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errortxt}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminLogin;


// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import LoadingSpinner from '../UIElements/LoadingSpinner';
// import { Modal, Button } from "react-bootstrap";
// import axios from 'axios';
// import "../Admin/Login.css";

// const Login = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState();
//   const [errortxt, setErrortxt] = useState();
//   const [show, setShow] = useState(false);

//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);

//   const inputHandler1 = (event) => {
//     setEmail(event.target.value);
//   };

//   const inputHandler2 = (event) => {
//     setPassword(event.target.value);
//   };

//   const authSubmitHandler = async (event) => {
//     event.preventDefault();

//     try {
//       setIsLoading(true);

//       const response = await axios.post('https://ticketflix-backend.onrender.com/adminlogin', {
//         email,
//         password
//       });

//       if (response.status === 200) {
//         navigate("/movieview");
//         localStorage.setItem("usertype", "admin");
//       } else {
//         setErrortxt(response.data.message);
//       }
//       setIsLoading(false);

//     } catch (err) {
//       setIsLoading(false);
//       setErrortxt(err.response?.data?.message || 'Something went wrong, please try again.');
//     }
    
//     if (errortxt) handleShow();
//   };

//   return (
//     <div className="Login_body">
//       <section className="Login_section">
//         <form onSubmit={authSubmitHandler}>
//           <h1 className="loginclass">Admin sign in</h1>

//           <div className="login_input_box">
//             <ion-icon name="mail-outline"></ion-icon>
//             <input
//               className="login"
//               type="email"
//               value={email}
//               onChange={inputHandler1}
//               id="email"
//               required
//             />
//             <label htmlFor="email">Email</label>
//           </div>

//           <div className="login_input_box">
//             <ion-icon name="lock-closed-outline"></ion-icon>
//             <input
//               type="password"
//               value={password}
//               onChange={inputHandler2}
//               id="password"
//               required
//             />
//             <label htmlFor="password">Password</label>
//           </div>

//           <div className="forget">
//             <label><input type="checkbox" /> Remember Me</label>
//             <a href="#">Forget Password</a>
//           </div>

//           <button className="Button_login" type="submit">Sign in</button>
//           <p className="mt-5 mb-3 text-muted">&copy; 2017–2021</p>
//         </form>
//       </section>

//       {isLoading && <LoadingSpinner asOverlay />}

//       <Modal className="error-message-alert" show={show} onHide={handleClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Error Message</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>{errortxt}</Modal.Body>
//         <Modal.Footer>
//           <Button variant="primary" onClick={handleClose}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default Login;
