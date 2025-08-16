// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ticketflix-official.netlify.app',
//   baseURL: 'http://localhost:5000',
});

export default api;