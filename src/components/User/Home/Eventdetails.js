import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../Utils/api";
import Footer from "./Footer";

function Eventdetails() {
  const [eventImage, setEventImage] = useState("");
  const [Name, seteventName] = useState("");
  const [eventLanguage, seteventLanguage] = useState("");
  const [eventDuration, seteventDuration] = useState("");
  const [eventArtist, seteventArtist] = useState([]);
  const [Venue, seteventVenue] = useState("");
  const [eventAbout, seteventAbout] = useState("");
  const [eventDate, seteventDate] = useState(null);
  const [Time, seteventTime] = useState([]); // array of times (from event or schedule)
  const [eventType, seteventType] = useState("");
  const [eventSchedule, setEventSchedule] = useState(null);
  const [eventPricing, setEventPricing] = useState(null);
  const [location, setlocation] = useState(null);
  const [ageLimit, setAgeLimit] = useState(null);
  const [interestedCount, setInterestedCount] = useState(null);
  const [otherVenuesCount, setOtherVenuesCount] = useState(null);

  const [eventtimePopup, seteventtimePopup] = useState(false);
  const [id, setId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Helper: robustly get [lat, lng] from different backend formats
  const getLatLng = (loc) => {
    if (!loc) return null;
    if (typeof loc.latitude === "number" && typeof loc.longitude === "number") {
      return [loc.latitude, loc.longitude];
    }
    if (typeof loc.lat === "number" && typeof loc.lng === "number") {
      return [loc.lat, loc.lng];
    }
    if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
      const a = Number(loc.coordinates[0]);
      const b = Number(loc.coordinates[1]);
      if (!isNaN(a) && !isNaN(b)) {
        if (a >= -90 && a <= 90 && b >= -180 && b <= 180) return [a, b];
        if (b >= -90 && b <= 90 && a >= -180 && a <= 180) return [b, a];
        return [a, b];
      }
    }
    return null;
  };

  const fetchData = async (eventID) => {
    try {
      const eventResponse = await api.get(`/getevent/${eventID}`);
      console.log(eventResponse);
      const data = eventResponse.data || {};

      // map fields coming from your backend - adjust if keys differ
      const {
        eventName,
        name,
        eventLanguage,
        eventDuration,
        eventArtist,
        eventVenue,
        venue,
        imageURL,
        eventAbout,
        description,
        eventDate,
        date,
        eventTime,
        times,
        eventType,
        type,
        location,
        ageLimit,
        interestedCount,
      } = data;

      setEventImage( imageURL);
      seteventName(eventName || name || "");
      seteventLanguage(eventLanguage || "");
      seteventDuration(eventDuration || "");
      seteventArtist(Array.isArray(eventArtist) ? eventArtist : []);
      seteventVenue(eventVenue || venue || "");
      seteventAbout(eventAbout || description || "");
      seteventDate(eventDate || date || null);
      seteventTime(Array.isArray(eventTime) ? eventTime : Array.isArray(times) ? times : []);
      seteventType(eventType || type || "");
      setlocation(location || null);
      setAgeLimit(ageLimit || null);
      setInterestedCount(interestedCount || null);

      // optional schedule fetch (non-blocking)
      try {
        const scheduleResponse = await api.get(`/eventschedule`);
        const schedules = scheduleResponse.data || [];
        const matchedSchedule = schedules.find(
          (s) =>
            (s.eventName && (s.eventName === (eventName || name))) ||
            (s.name && (s.name === (eventName || name)))
        );
        if (matchedSchedule) {
          setEventSchedule(matchedSchedule);
          const showTimes = matchedSchedule.EventshowTime || matchedSchedule.showTimes || [];
          if (Array.isArray(showTimes) && showTimes.length > 0) {
            const allTimes = showTimes.flatMap((st) =>
              Array.isArray(st.times) ? st.times : st.time ? [st.time] : []
            ).filter(Boolean);
            const simpleTimes =
              allTimes.length > 0
                ? allTimes
                : showTimes.map((st) => (typeof st === "string" ? st : st.time || st.showTime || null)).filter(Boolean);
            seteventTime((prev) => (simpleTimes.length ? simpleTimes : prev));
            const firstPricing = showTimes[0] || matchedSchedule.EventshowTime?.[0] || {};
            setEventPricing(firstPricing);
            if (Array.isArray(matchedSchedule.otherVenues)) {
              setOtherVenuesCount(matchedSchedule.otherVenues.length);
            } else if (typeof matchedSchedule.otherVenuesCount === "number") {
              setOtherVenuesCount(matchedSchedule.otherVenuesCount);
            }
          } else {
            if (matchedSchedule.EventshowTime && matchedSchedule.EventshowTime[0]) {
              setEventPricing(matchedSchedule.EventshowTime[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Error fetching schedule:", err);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  useEffect(() => {
    const eventID = localStorage.getItem("id");
    if (!eventID) {
      navigate("/");
      return;
    }
    setId(eventID);
    fetchData(eventID);
  }, [navigate]);

  const handleClick = () => {
    if (Time && Time.length > 1) {
      seteventtimePopup(true);
    } else {
      handleTimeSelect(Time && Time.length === 1 ? Time[0] : null);
    }
  };

  const handleTimeSelect = (chosenTime) => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    navigate("/eventticketbooking", {
      state: {
        Name,
        Venue,
        eventDate,
        Time,
        pricing: eventPricing || {},
        userEmail: storedEmail,
        chosenTime,
      },
    });
    seteventtimePopup(false);
  };

  const closeTimePopup = () => {
    seteventtimePopup(false);
  };

  const formatDate = (d) => {
    if (!d) return "TBA";
    try {
      const dateObj = new Date(d);
      if (!isNaN(dateObj)) return dateObj.toDateString();
      return d;
    } catch {
      return d;
    }
  };

  const getPriceText = () => {
    if (eventPricing) {
      const priceKeys = ["BronzeTicketPrice", "price", "ticketPrice", "minPrice", "lowestPrice"];
      for (const k of priceKeys) {
        if (eventPricing[k]) return `₹${eventPricing[k]} onwards`;
      }
    }
    return "Lowest Price: N/A";
  };

  const latlng = getLatLng(location);

  // open maps centered on coords if available, otherwise search by address or venue name
  const openMapsAtVenue = () => {
    let url = "https://www.google.com/maps";
    if (latlng && latlng.length === 2) {
      url = `https://www.google.com/maps/search/?api=1&query=${latlng[0]},${latlng[1]}`;
    } else if (location && location.address) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
    } else if (Venue) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(Venue)}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 xl:px-24 2xl:px-48 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <div className="rounded-lg overflow-hidden bg-gray-200">
              {eventImage ? (
                <img src={eventImage} alt={Name} className="w-full h-80 object-cover lg:h-[420px]" />
              ) : (
                <div className="w-full h-80 lg:h-[420px] flex items-center justify-center text-gray-400">No image available</div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">{Name || "Event Title"}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {eventType && <span className="text-xs bg-gray-800 text-white px-3 py-1 rounded-full">{eventType}</span>}
                  {eventLanguage && <span className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded-full">{eventLanguage}</span>}
                  {eventDuration && <span className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded-full">{eventDuration}</span>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {interestedCount ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.707a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" /></svg>
                    <span className="text-sm text-gray-700">{interestedCount}</span>
                  </div>
                ) : null}
                <button className="text-sm border border-red-400 text-red-600 px-3 py-1 rounded-md">I'm Interested</button>
              </div>
            </div>

            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-2">About The Event</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{eventAbout || "Description not available."}</p>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-20">
              <div className="bg-white border rounded-lg p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-gray-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M7 11h10M7 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700">{formatDate(eventDate)}</div>
                    <div className="text-xs text-gray-400">Dates</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="text-gray-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700">{Time && Time.length > 0 ? Time[0] : "TBA"}</div>
                    <div className="text-xs text-gray-400">Time</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="text-gray-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.2 5.3l2.8 2.8M17 16.9l2.8 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700">{eventDuration || "TBA"}</div>
                    <div className="text-xs text-gray-400">Duration</div>
                  </div>
                </div>

                {ageLimit && (
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-gray-500">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 12v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="1.5" /></svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-700">{ageLimit}</div>
                      <div className="text-xs text-gray-400">Age Limit</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <div className="text-gray-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700">{eventLanguage || "TBA"}</div>
                    <div className="text-xs text-gray-400">Language</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="text-gray-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700">{eventType || "TBA"}</div>
                    <div className="text-xs text-gray-400">Genre</div>
                  </div>
                </div>

                {/* Venue row: text + compact map icon (opens Google Maps) */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-gray-500">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" /></svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-700">{Venue || "Venue TBA"}</div>
                      {typeof otherVenuesCount === "number" && (
                        <div className="text-xs text-red-500">View {otherVenuesCount} Other Cities</div>
                      )}
                    </div>
                  </div>

                  {/* compact, accessible map icon button */}
                  <div>
                    <button
                      onClick={openMapsAtVenue}
                      title="Open in Google Maps"
                      aria-label="Open venue in Google Maps"
                      className="p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
                      style={{ width: 36, height: 36 }}
                    >
                      {/* map-pin icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 21s6-4.35 6-10a6 6 0 10-12 0c0 5.65 6 10 6 10z" />
                        <path d="M12 11.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="border-t my-3" />

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{getPriceText()}</div>
                    <div className="text-xs text-yellow-600"></div>
                  </div>
                  <div>
                    <button onClick={handleClick} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">Book Now</button>
                  </div>
                </div>
              </div>

              {/* ARTIST SECTION MOVED HERE (to the right/map area) */}
              <div className="mt-4 bg-white border rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Artist</h4>
                {eventArtist && eventArtist.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {eventArtist.map((artist, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {artist.image ? (
                          <img src={artist.image} alt={artist.name || artist.artist} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{artist.artist || artist.name || "Artist"}</div>
                          {artist.name && <div className="text-xs text-gray-500">{artist.name}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No artist info available.</div>
                )}
              </div>

            </div>
          </aside>
        </div>
      </div>

      {eventtimePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 xl:p-6 w-full max-w-xs xl:max-w-md 2xl:max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-700 hover:text-gray-500 text-xl" onClick={closeTimePopup}>&times;</button>
            <h4 className="text-lg md:text-xl font-bold mb-3">Select Event Time</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {Time && Time.length > 0 ? (
                Time.map((time, i) => (
                  <button key={i} className="border rounded-full px-3 py-1 md:px-4 md:py-2 xl:px-5 xl:py-3 text-sm md:text-base hover:bg-gray-800 hover:text-white transition" onClick={() => handleTimeSelect(time)}>
                    {time}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">No available times</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* bottom area kept minimal since artist moved to right column */}
      <div className="container mx-auto px-4 xl:px-24 2xl:px-48 pb-12">
        <div className="grid grid-cols-1 gap-6 mt-8">
          {/* reserved for additional content if needed */}
        </div>
      </div>

      {/* mobile fixed book button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-3 shadow-inner flex justify-center md:hidden">
        <button onClick={handleClick} className="bg-red-500 text-white w-full max-w-md py-2 rounded-md text-base font-semibold hover:bg-red-600 transition">Book</button>
      </div>

      <Footer />
    </div>
  );
}

export default Eventdetails;