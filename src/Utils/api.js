// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ticketflix-backend.onrender.com',
//   baseURL: 'http://localhost:5000',
});

export default api;