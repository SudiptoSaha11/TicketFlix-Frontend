import React, { useState } from "react";
import "./Faq.css"; // Import your FAQ-specific CSS

const Faq = () => {
  // Sample FAQ data (customize as needed)
  const faqData = [
    {
      question: "Why Become an Online Member?",
      answer: `Your exclusive username and password let you buy movie tickets hassle-free. 
      As an online member, you can enjoy the privilege of advance booking, loyalty 
      points, exclusive movie merchandise, and more! Register now to experience 
      TicketFlix at its best.`,
    },
    {
      question: "5 Simple Steps to Buy Tickets Online",
      answer: `1) Sign up or log in to your TicketFlix account. 
      2) Browse the movie list. 
      3) Select your preferred showtime. 
      4) Choose seats and pay online. 
      5) Receive your e-ticket instantly!`,
    },
    {
      question: "Charges for Booking Tickets Online?",
      answer: `TicketFlix may charge a nominal internet handling fee. The exact amount 
      depends on the payment gateway and theater policies. All fees will be clearly 
      displayed before you confirm your booking.`,
    },
    {
      question: "Can I Book Tickets in Advance?",
      answer: `Absolutely! As a TicketFlix member, you can book tickets days or even weeks 
      before the official release date, depending on the cinema's policy.`,
    },
    {
      question: "Can I Cancel Tickets Booked Online and Get a Refund?",
      answer: `Refund policies vary by theater. If cancellation is allowed, you’ll see a 
      “Cancel Booking” option under your account’s “My Bookings” section. A refund 
      (minus any convenience fees) will be processed back to your original payment 
      method, usually within 5-7 business days.`,
    },
    {
      question: "Is the facility available on tickets bought from the Cinema?",
      answer: `No, you can only modify or cancel tickets purchased through TicketFlix 
      online. Tickets purchased directly at the cinema counter must follow the 
      cinema's own policies.`,
    },
    {
      question: "What is the amount of refund I will get on cancellation of the ticket?",
      answer: `Refund amounts depend on the time of cancellation and the cinema’s 
      policy. Check the cancellation policy details on the booking page 
      before confirming your purchase.`,
    },
    {
      question: "Can partially used tickets be cancelled?",
      answer: `Once a ticket is partially used (e.g., if you’ve already viewed part of 
      the show), it generally cannot be cancelled. Please confirm with the 
      theater's policy for exceptions.`,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  // Toggle the accordion open/close
  const handleToggle = (index) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="faq-container">
      <h1 className="faq-title">FAQ</h1>
      <div className="faq-list">
        {faqData.map((item, index) => (
          <div key={index} className="faq-item">
            <button
              className="faq-question"
              onClick={() => handleToggle(index)}
            >
              {item.question}
              <span className="faq-icon">
                {activeIndex === index ? "−" : "+"}
              </span>
            </button>
            {activeIndex === index && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;