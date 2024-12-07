"use client";

import { useState, useEffect } from "react";
import TrailCard from "./TrailCard";

const TrailCardList = ({ data, handleTagClick }) => {
  return (
    <div className="trail_container">
      <div className='mt-16 trail_layout'>
        {data.map((post) => (
          <TrailCard
            key={post._id}
            post={post}
            handleTagClick={handleTagClick}
          />
        ))}
      </div>
    </div> 
  );
};

const Feed = () => {
  const [featuredTrails, setFeaturedTrails] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch 3 random featured trails on initial load
  const fetchFeaturedTrails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/trail/featured");
      const data = await response.json();
      setFeaturedTrails(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch featured trails:", error);
      setIsLoading(false);
    }
  };

  // Search trails from database
  const searchTrails = async (searchText) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/trail/search?query=${encodeURIComponent(searchText)}`);
      const data = await response.json();
      setSearchedResults(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to search trails:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedTrails();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // If search text is empty, show featured trails
    if (value.trim() === "") {
      setSearchedResults([]);
      return;
    }

    // Debounce search
    setSearchTimeout(
      setTimeout(() => {
        searchTrails(value);
      }, 500)
    );
  };

  const handleTagClick = (tagName) => {
    setSearchText(tagName);
    searchTrails(tagName);
  };

  return (
    <section className='feed'>
      <form className='relative w-full max-w-2xl flex-center'>
        <input
          type='text'
          placeholder='Search for a trail'
          value={searchText}
          onChange={handleSearchChange}
          required
          className='search_input peer'
        />
      </form>

      {/* Conditional rendering based on search and loading state */}
      {isLoading ? (
        <div className="text-center mt-10">Loading trails...</div>
      ) : searchText ? (
        searchedResults.length > 0 ? (
          <TrailCardList
            data={searchedResults}
            handleTagClick={handleTagClick}
          />
        ) : (
          <div className="text-center mt-10">No trails found</div>
        )
      ) : (
        <TrailCardList 
          data={featuredTrails} 
          handleTagClick={handleTagClick} 
        />
      )}
    </section>
  );
};

export default Feed;