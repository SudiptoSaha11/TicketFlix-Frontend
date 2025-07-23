// src/getbotreply.js
export function getBotReply(userText, context) {
  const text = userText.toLowerCase().trim();
  let botReply       = "Sorry, I didn’t catch that. Can you rephrase?";
  let updatedContext = { ...context, clear: false };

  // ─── Main Menu Options ───
  const mainOptions = [
    { label: "Browse Movies", payload: "browse movies" },
    { label: "Movie Details", payload: "movie details" },
    { label: "Book Tickets",  payload: "book tickets" },
    { label: "Showtimes",     payload: "showtimes" }
  ];

  // 0) Clear chat
  if (text === "clear chat" || text === "clear") {
    updatedContext.clear = true;
    botReply = "👋 Restarted! Hi, I'm TicketFlixBot how can I help you today?";
    return { botReply, updatedContext };
  }

  // 1) Greetings
  if (/(hello|hi|hey)/.test(text)) {
    botReply = "Hello! What would you like to do?";
    updatedContext.options = mainOptions;
    return { botReply, updatedContext };
  }

  // remove stale options
  if (context.options) delete updatedContext.options;

  // 2) Yes/No
  if (text === "yes") {
    botReply = "Main menu—please choose:";
    updatedContext.options = mainOptions;
    return { botReply, updatedContext };
  }
  if (text === "no") {
    botReply = "Okay! Let me know if you need anything else.";
    return { botReply, updatedContext };
  }

  // ─── 3) Show fetched movie list ───
  if (text === "movies" || text === "movie" || text.includes("show movies")) {
    const list = Array.isArray(context.movieList) ? context.movieList : [];
    if (list.length === 0) {
      botReply = "Sorry, I couldn't load the movie list right now. Try again later.";
    } else {
      botReply = "Here are the movies currently available:";
      updatedContext.options = list.map(title => ({ label: title, payload: title }));
    }
    updatedContext.askMainMenu = true;
    return { botReply, updatedContext };
  }

  // 4) Browse all
  if (text.includes("browse")) {
    botReply = "Here's our full movie catalog. Click to browse:";
    updatedContext.linkTo = { to: "/movies", label: "Browse All Movies" };
    updatedContext.askMainMenu = true;
    return { botReply, updatedContext };
  }

  // 5) Details flow
  if (text.includes("movie details")) {
    updatedContext.waitingForTitle = true;
    botReply = "Which movie would you like details for?";
    return { botReply, updatedContext };
  }
  if (context.waitingForTitle) {
    const title = encodeURIComponent(text);
    botReply = `Details for "${text}"—click below:`;
    updatedContext.linkTo = { to: `/movies/${title}`, label: `View "${text}" Details` };
    updatedContext.waitingForTitle = false;
    updatedContext.askMainMenu = true;
    return { botReply, updatedContext };
  }

  // 6) Booking flow
  if (text.includes("book tickets")) {
    updatedContext.waitingForBooking = true;
    botReply = "Which movie do you want to book tickets for?";
    return { botReply, updatedContext };
  }
  if (context.waitingForBooking) {
    const movie = encodeURIComponent(text);
    botReply = `Booking for "${text}"—select seats:`;
    updatedContext.linkTo = { to: `/booking/${movie}`, label: `Book "${text}" Tickets` };
    updatedContext.waitingForBooking = false;
    updatedContext.askMainMenu = true;
    return { botReply, updatedContext };
  }

  // 7) Showtimes flow
  if (text.includes("showtimes")) {
    updatedContext.waitingForShowtime = true;
    botReply = "Enter the movie name to see showtimes:";
    return { botReply, updatedContext };
  }
  if (context.waitingForShowtime) {
    const mv = encodeURIComponent(text);
    botReply = `Showtimes for "${text}":`;
    updatedContext.linkTo = { to: `/showtimes/${mv}`, label: `See "${text}" Showtimes` };
    updatedContext.waitingForShowtime = false;
    updatedContext.askMainMenu = true;
    return { botReply, updatedContext };
  }

  // 8) Fallback
  botReply = "I can help you browse movies, get details, book tickets or see showtimes. What would you like?";
  updatedContext.options = mainOptions;
  return { botReply, updatedContext };
}