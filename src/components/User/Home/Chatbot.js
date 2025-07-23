// src/components/Chatbot.jsx
import React, { useEffect, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { MessageSquare } from "lucide-react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { getBotReply } from "./getbotreply";
import { Link } from "react-router-dom";

const CHAT_LOTTIE_URL = "https://lottie.host/26a714a7-6c3b-42e6-82d1-fbf5915e1c5e/EwZuIQZQpu.lottie";

const FloatingButton = styled.button`
  position: fixed; 
  bottom: 4rem; 
  right: 1.5rem; 
  z-index: 50;
  padding: .25rem; border: none; border-radius: 9999px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1),
              0 4px 6px -2px rgba(0,0,0,0.05);
  cursor: pointer; transition: background-color .2s;
`;

const ChatContainer = styled.div`
  position: fixed; bottom: 5rem; right: 1.5rem;
  width: 20rem; max-width: 24rem; max-height: 32rem;
  background: #fff; border-radius: .75rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  display: flex; flex-direction: column; overflow: hidden; z-index: 50;
`;

const HeaderBar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  background-color: #2d3748; color: #fff; padding: .5rem 1rem; font-weight: 600;
`;

const MessagesArea = styled.div`
  flex: 1; padding: .5rem 1rem; background-color: #f7fafc;
  overflow-y: auto; display: flex; flex-direction: column; gap: .5rem;
  scroll-behavior: smooth;
`;

const bounce = keyframes`
  0%,100% { opacity:.2; transform:translateY(0); }
  50%     { opacity:1;   transform:translateY(-4px); }
`;

const TypingBubble = styled.div`
  align-self: flex-start; background-color: #e2e8f0; color: #1a202c;
  padding: .5rem; border-radius: .5rem; animation: ${bounce} 1s infinite;
`;

const MessageRow = styled.div`
  display:flex; justify-content: ${props => props.from === "user" ? "flex-end" : "flex-start"};
`;

const MessageBubble = styled.div`
  max-width:70%; padding:.5rem .75rem; border-radius:.75rem;
  background-color: ${props => props.from === "user" ? "#bee3f8" : "#fed7d7"};
  color:#1a202c; word-break:break-word;
`;

const InputArea = styled.div`
  display:flex; border-top:1px solid #e2e8f0; padding:.5rem; background:#fff;
`;

const TextInput = styled.input`
  flex:1; padding:.5rem .75rem; border:1px solid #cbd5e0; border-radius:9999px; outline:none;
  &:focus { box-shadow:0 0 0 2px rgba(45,55,72,.5); border-color:#2d3748; }
`;

const SendButton = styled.button`
  margin-left:.5rem; padding:.5rem 1rem; background-color:#2d3748; color:#fff;
  border:none; border-radius:9999px; cursor:pointer; transition:background .2s;
  &:hover { background-color:#1a202c; }
`;

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem("chatMessages");
    return stored
      ? JSON.parse(stored)
      : [{ from: "bot", text: "👋 Hi! Welcome to TicketFlixBot. What can I help you with?" }];
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [botContext, setBotContext] = useState({});
  const [movieList, setMovieList] = useState([]);
  const messagesEndRef = useRef(null);
  const wrapperRef = useRef(null);

  // Fetch movie titles from backend once
  useEffect(() => {
    axios.get("http://localhost:5000/movieview")
      .then(res => setMovieList(res.data.map(m => m.movieName)))
      .catch(err => console.error("Movie fetch error:", err));
  }, []);

  // Persist & auto‑scroll
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sendMessage = (text) => {
    setMessages(m => [...m, { from: "user", text }]);
    setTyping(true);

    setTimeout(() => {
      // pass movieList into context so getBotReply can use it
      const { botReply, updatedContext } = getBotReply(text, { ...botContext, movieList });
      if (updatedContext.clear) {
        localStorage.removeItem("chatMessages");
        setMessages([{ from: "bot", text: botReply }]);
      } else {
        setMessages(m => [...m, { from: "bot", text: botReply }]);
        if (updatedContext.options) {
          setMessages(m => [...m, { from: "bot", options: updatedContext.options }]);
        }
        if (updatedContext.linkTo) {
          setMessages(m => [...m, { from: "bot", link: updatedContext.linkTo }]);
        }
        if (updatedContext.askMainMenu) {
          setMessages(m => [...m, { from: "bot", askMainMenu: true }]);
        }
      }
      setBotContext(updatedContext);
      setTyping(false);
    }, 600);
  };

  const onKeyDown = e => {
    if (e.key === "Enter" && input.trim()) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div ref={wrapperRef}>
      <FloatingButton onClick={() => setOpen(o => !o)}>
        <DotLottieReact src={CHAT_LOTTIE_URL} loop autoplay style={{ width: 65, height: 65 }} />
      </FloatingButton>

      {open && (
        <ChatContainer>
          <HeaderBar>
            TicketFlix Bot <MessageSquare size={20} />
          </HeaderBar>

          <MessagesArea>
            {messages.map((msg, idx) => {
              if (msg.options) {
                return (
                  <MessageRow key={idx} from="bot">
                    <MessageBubble from="bot">
                      {msg.options.map(opt => (
                        <button
                          key={opt.payload}
                          onClick={() => sendMessage(opt.payload)}
                          style={{
                            margin: "0.25rem",
                            padding: "0.5rem 1rem",
                            borderRadius: "9999px",
                            border: "1px solid #2d3748",
                            background: "white",
                            color: "#2d3748",
                            cursor: "pointer"
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </MessageBubble>
                  </MessageRow>
                );
              }
              if (msg.askMainMenu) {
                return (
                  <MessageRow key={idx} from="bot">
                    <MessageBubble from="bot">
                      <div>Back to main menu?</div>
                      <button onClick={() => sendMessage("yes")} style={{ margin: "0.25rem", padding: "0.5rem 1rem", borderRadius: "9999px", border: "1px solid #38a169", background: "white", color: "#38a169", cursor: "pointer" }}>Yes</button>
                      <button onClick={() => sendMessage("no")} style={{ margin: "0.25rem", padding: "0.5rem 1rem", borderRadius: "9999px", border: "1px solid #e53e3e", background: "white", color: "#e53e3e", cursor: "pointer" }}>No</button>
                    </MessageBubble>
                  </MessageRow>
                );
              }
              if (msg.link) {
                return (
                  <MessageRow key={idx} from="bot">
                    <MessageBubble from="bot">
                      <Link to={msg.link.to} style={{ color: "#2d3748", textDecoration: "none" }}>
                        {msg.link.label}
                      </Link>
                    </MessageBubble>
                  </MessageRow>
                );
              }
              return (
                <MessageRow key={idx} from={msg.from}>
                  <MessageBubble from={msg.from}>
                    <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                  </MessageBubble>
                </MessageRow>
              );
            })}

            {typing && <TypingBubble>Typing…</TypingBubble>}
            <div ref={messagesEndRef} />
          </MessagesArea>

          <InputArea>
            <TextInput
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <SendButton onClick={() => input.trim() && (sendMessage(input.trim()), setInput(""))}>
              Send
            </SendButton>
          </InputArea>
        </ChatContainer>
      )}
    </div>
  );
};

export default Chatbot;