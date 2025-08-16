import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../Utils/api';
import debounce from 'lodash.debounce';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);

  // Fetch all movies for initial suggestions/trending
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/movieview');
        setAllMovies(res.data);
      } catch (err) {
        console.error('Failed to fetch movie list:', err);
      }
    })();
  }, []);

  // Setup suggested and trending lists
  useEffect(() => {
    setSuggestedItems(
      allMovies.slice(0, 3).map(m => m.movieName)
    );
    setTrendingItems(
      allMovies.slice(3, 8).map(m => ({ term: m.movieName, icon: '📅' }))
    );
  }, [allMovies]);

  // Fetch autocomplete suggestions including movie posters
  const fetchSuggestions = async (q) => {
    if (!q) return setSuggestions([]);
    try {
      const [movR, evtR] = await Promise.all([
        api.get(`/api/autocomplete?search=${encodeURIComponent(q)}`),
        api.get(`/api/eventcomplete?search=${encodeURIComponent(q)}`)
      ]);
      const movies = movR.data.map(i => ({
        _id: i._id,
        type: 'movie',
        label: i.movieName,
        image: i.image,      // poster URL
      }));
      const events = evtR.data.map(i => ({
        _id: i._id,
        type: 'event',
        label: i.eventName,
        image: null,        // no poster for events
      }));
      setSuggestions([...movies, ...events]);
    } catch {
      setSuggestions([]);
    }
  };
  const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), []);

  // Trigger search on term change
  useEffect(() => {
    if (searchTerm.trim()) debouncedFetch(searchTerm);
    else setSuggestions([]);
    return () => debouncedFetch.cancel();
  }, [searchTerm, debouncedFetch]);

  const goHome = () => navigate('/');
  const doSearch = () => {
    if (!searchTerm.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    setSearchTerm('');
  };
  const pickSuggestion = item => {
    const path = item.type === 'movie' ? '/moviedetails' : '/eventdetails';
    navigate(`${path}/${item._id}`, { state: item });
  };
  const pickTerm = term => {
    navigate(`/search?query=${encodeURIComponent(term)}`);
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="relative max-w-md mx-auto ">
        {/* Search box */}
        <div className="flex items-center border rounded px-3 py-2 bg-white">
          <button onClick={goHome} className="mr-2 text-gray-600 hover:text-gray-800 text-xl">
            &larr;
          </button>
          <input
            type="text"
            className="flex-1 outline-none"
            placeholder="Search movies, events, plays & more"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
          />
          <button onClick={doSearch} className="ml-2 font-medium">
            Search
          </button>
        </div>

        {/* Live autocomplete with posters */}
        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-white border border-t-0 z-50 mt-1 flex flex-col">
            <li className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase border-b"></li>
            {suggestions.map((it, i) => (
              <li
                key={i}
                onClick={() => pickSuggestion(it)}
                className="flex items-center ml-[0px] py-2 cursor-pointer hover:bg-gray-100"
              >
                {it.image && (
                  <img
                    src={it.image}
                    alt={it.label}
                    className="w-10 h-14 object-cover mr-3 rounded"
                  />
                )}
                <span>{it.label}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Suggested & Trending when empty */}
        {searchTerm.trim() === '' && (
          <>
            <div className="bg-white rounded shadow mt-4">
              <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase border-b">
                Suggested Search
              </div>
              {suggestedItems.map((term, i) => (
                <div
                  key={i}
                  onClick={() => pickTerm(term)}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                >
                  {term}
                </div>
              ))}
            </div>

            <div className="bg-white rounded shadow mt-4">
              <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase border-b">
                Trending Searches
              </div>
              {trendingItems.map((it, i) => (
                <div
                  key={i}
                  onClick={() => pickTerm(it.term)}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                >
                  <span>{it.term}</span>
                  <span className="text-gray-400 text-lg">{it.icon}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;