import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import QRPage from './QRpage'; // QRPage expects an `id` prop
import api from '../../../Utils/api';

const QRProtectedPage = () => {
  const { id } = useParams();
  const [loggedIn, setLoggedIn] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    // Force logout by removing any previous session
    sessionStorage.removeItem('staffId');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/staff/login', formData);
      sessionStorage.setItem('staffId', res.data.staffId); // You can remove this line if you want zero persistence
      setLoggedIn(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  if (loggedIn) {
    return <QRPage id={id} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Staff Login</h2>
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Login to Proceed
        </button>
      </form>
    </div>
  );
};

export default QRProtectedPage;
