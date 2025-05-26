import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';
import { X } from 'lucide-react';

const Chatbot = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isWaitingForMovie, setIsWaitingForMovie] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCollapsed) {
      setMessages([{ text: 'Welcome to TicketFlix Bot! How can I help you? 🎟️', sender: 'bot' }]);
    }
  }, [isCollapsed]);

  const handleUserInput = (event) => {
    setUserInput(event.target.value);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (userInput.trim() === '') return;

    setMessages((prevMessages) => [...prevMessages, { text: userInput, sender: 'user' }]);
    setLoading(true);

    try {
      if (userInput.toLowerCase() === 'hi' || userInput.toLowerCase() === 'hello') {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'Hello! How can I assist you today? ☺️', sender: 'bot' },
        ]);
      } else if (userInput.toLowerCase().includes('book ticket')) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'Sure! Please enter the movie name.', sender: 'bot' },
        ]);
        setIsWaitingForMovie(true);
      } else if (userInput.toLowerCase() === 'clear chat') {
        setMessages([{ text: 'Chat history cleared.', sender: 'bot' }]);
      } else if (isWaitingForMovie) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `You selected ${userInput}. Redirecting you to the ticket booking page...`, sender: 'bot' },
        ]);

        setTimeout(() => {
          navigate('/ticketbooking', { state: { movieName: userInput.trim() } });
        }, 1000);
        setIsWaitingForMovie(false);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'Sorry, I didn’t understand that. Please type "book ticket" to start booking.', sender: 'bot' },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Sorry, something went wrong. Please try again.', sender: 'bot' },
      ]);
    } finally {
      setUserInput('');
      setLoading(false);
    }
  };

  const toggleChatbot = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`chatbot-container ${isCollapsed ? 'collapsed' : 'expanded'}`} onClick={toggleChatbot}>
      <div className="chat-window" onClick={(e) => e.stopPropagation()}>
        {!isCollapsed && (
          <>
            <button className="close-button" onClick={toggleChatbot} title="Close">
              <X size={20} />
            </button>

            <div className="chatbot-header">Welcome to TicketFlix Bot</div>

            <div className="chatbot-messages">
              {messages.map((message, index) => (
                <div key={index} className={message.sender === 'user' ? 'chatbot-user-message' : 'bot-message'}>
                  {message.text}
                </div>
              ))}
              {loading && <div className="bot-message loading">Loading...</div>}
            </div>

            <form onSubmit={sendMessage} className="chatbot-form">
              <input
                className="input-chatbot"
                type="text"
                value={userInput}
                onChange={handleUserInput}
                placeholder="Ask me about movies, schedules, type 'book ticket' to start booking, or 'clear chat' to clear the chat..."
              />
              <button type="submit" className="chatbot-button"></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
