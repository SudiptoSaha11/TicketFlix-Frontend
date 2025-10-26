// PaymentPage.js
import React from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // Import useLocation
import api from '../../../Utils/api';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('your-publishable-key-here');

const CheckoutForm = ({ bookingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error('[error]', error);
      alert(`Payment failed: ${error.message}`);
    } else {
      console.log('[PaymentMethod]', paymentMethod);

      // Send paymentMethod.id and bookingDetails to your server for processing
      try {
        await api.post('/payment', {
          paymentMethodId: paymentMethod.id,
          amount: bookingDetails.totalAmount * 100, // Amount in cents
          bookingDetails,
        });
        alert('Payment successful!');
      } catch (error) {
        console.error('Payment error:', error);
        alert('Payment processing error.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement 
        options={{
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSize: '16px',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a',
            },
          },
        }}
      />
      <button type="submit" disabled={!stripe}>
        Pay ₹{bookingDetails.totalAmount}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const location = useLocation(); // Use useLocation to get location object
  const { bookingDetails } = location.state || {}; // Extract bookingDetails from location.state

  return (
    <div>
      <h2>Payment Page</h2>
      {bookingDetails ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm bookingDetails={bookingDetails} />
        </Elements>
      ) : (
        <p>No booking details available.</p>
      )}
    </div>
  );
};

export default PaymentPage;