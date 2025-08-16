import React, { useState } from 'react';
import api from '../../../Utils/api';

const StaffLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = formData;
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      const res = await api.post('/staff/login', formData);
      setSuccess(res.data.message);
      // You can store staffId in localStorage/sessionStorage if needed
      // localStorage.setItem('staffId', res.data.staffId);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Staff Login</h2>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-sm">{success}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
            autoComplete="username"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default StaffLogin;
