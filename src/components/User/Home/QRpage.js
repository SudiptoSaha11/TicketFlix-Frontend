import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../../Utils/api';

const QRpage = () => {
  const { pid } = useParams(); // ✅ Use correct param name
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/booking/${pid}`);
        setBooking(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [pid]);

  const updateStatus = async (newStatus) => {
    if (!booking || !['pending', 'confirmed'].includes(booking.status)) {
      setError(`Cannot ${newStatus}, ticket already ${booking?.status}`);
      return;
    }

    try {
      const res = await api.patch(`/qrupdate/${pid}`, {
        status: newStatus,
      });
      setBooking(res.data.booking);
      setStatusMsg(`Ticket ${newStatus} successfully.`);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-opacity-50"></div>
      </div>
    );
  }

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!booking) return <div className="p-4">No booking found</div>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-xl space-y-4 mt-6 relative">

      <h2 className="text-2xl font-bold text-center">🎫 Ticket Validation</h2>

      <div className="text-sm space-y-1">
        <p><strong>Name:</strong> {booking.Name}</p>
        <p><strong>Email:</strong> {booking.userEmail}</p>
        <p><strong>Venue:</strong> {booking.Venue}</p>
        <p><strong>Time:</strong> {booking.Time}</p>
        <p><strong>Language:</strong> {booking.Language}</p>

        <p><strong>Seats:</strong> {booking.seats.join(', ')}</p>
        <p>
          <strong>Status:</strong>{' '}
          <span className={`font-semibold ${
            booking.status === 'used'
              ? 'text-green-600'
              : booking.status === 'rejected'
              ? 'text-red-600'
              : 'text-yellow-600'
          }`}>
            {booking.status}
          </span>
        </p>
      </div>

      {['pending', 'confirmed'].includes(booking.status) ? (
        <div className="flex justify-between gap-4">
          <button
            onClick={() => updateStatus('used')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full"
          >
            ✅ Validate
          </button>
          <button
            onClick={() => updateStatus('rejected')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-full"
          >
            ❌ Reject
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-600 italic">
          No further actions allowed. Ticket already {booking.status}.
        </div>
      )}

      {statusMsg && (
        <div className="text-green-600 font-medium text-center">{statusMsg}</div>
      )}
    </div>
  );
};

export default QRpage;
