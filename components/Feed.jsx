"use client";

import { useState, useEffect, useCallback } from "react";
import TrailCard from "./TrailCard";

const TrailCardList = ({ data, handleTagClick }) => {
  return (
    <div className='mt-16 trail_layout'>
      {data.map((post) => (
        <TrailCard
          key={post._id}
          post={post}
          handleTagClick={handleTagClick}
        />
      ))}
    </div>
  );
};

const Feed = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/trail?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch trails');
      }
      const data = await response.json();
      setAllPosts(data);
    } catch (error) {
      console.error("Error fetching trails:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    // Set up polling to fetch new data every 30 seconds
    const intervalId = setInterval(fetchPosts, 30000);
    return () => clearInterval(intervalId);
  }, [fetchPosts]);

  const filterTrails = useCallback((searchtext) => {
    const regex = new RegExp(searchtext, "i");
    return allPosts.filter(
      (item) =>
        regex.test(item.creator.username) ||
        regex.test(item.tag) ||
        regex.test(item.name) ||
        regex.test(item.location)
    );
  }, [allPosts]);

  const handleSearchChange = (e) => {
    clearTimeout(searchTimeout);
    setSearchText(e.target.value);

    setSearchTimeout(
      setTimeout(() => {
        const searchResult = filterTrails(e.target.value);
        setSearchedResults(searchResult);
      }, 500)
    );
  };

  const handleTagClick = (tagName) => {
    setSearchText(tagName);
    const searchResult = filterTrails(tagName);
    setSearchedResults(searchResult);
  };

  return (
    <section className='feed'>
      <form className='relative w-full flex-center'>
        <input
          type='text'
          placeholder='Search for a trail'
          value={searchText}
          onChange={handleSearchChange}
          required
          className='search_input peer'
        />
      </form>

      {isLoading ? (
        <p>Loading trails...</p>
      ) : searchText ? (
        <TrailCardList
          data={searchedResults}
          handleTagClick={handleTagClick}
        />
      ) : (
        <TrailCardList data={allPosts} handleTagClick={handleTagClick} />
      )}

      <button onClick={fetchPosts} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Refresh Trails
      </button>
    </section>
  );
};

export default Feed;