// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // or use an env variable (explained below)
  // You can also set default headers here if needed
});

export default api;
