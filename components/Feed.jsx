"use client"

import { useState, useEffect } from "react";
import TrailCard from "./TrailCard";

const TrailCardList = ({ data, handleTagClick }) => {
  return (
    <div className='mt-16 trail_layout'>
      {data.length > 0 ? (
        data.map((post) => (
          <TrailCard
            key={post._id}
            post={post}
            handleTagClick={handleTagClick}
          />
        ))
      ) : (
        <p>No trails found. Start by creating a new trail!</p>
      )}
    </div>
  );
};

const Feed = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/trail`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch trails');
        }
        const data = await response.json();
        console.log("Fetched trails:", data); // Log fetched data
        setAllPosts(data);
      } catch (error) {
        console.error("Error fetching trails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // Refetch when the component gains focus
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPosts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


 /*
  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch("/api/trail", { cache: 'no-store' });
      const data = await response.json();
      console.log("Fetched trails:", data); // Log fetched data
      setAllPosts(data);
    }

    fetchPosts();
  }, [])
 */

  const filterTrails = (searchtext) => {
    const regex = new RegExp(searchtext, "i");
    return allPosts.filter(
      (item) =>
        regex.test(item.creator.username) ||
        regex.test(item.tag) ||
        regex.test(item.name) ||
        regex.test(item.location)
    );
  };

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

  if (loading) {
    return <div>Loading trails...</div>;
  }

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

      {searchText ? (
        <TrailCardList
          data={searchedResults}
          handleTagClick={handleTagClick}
        />
      ) : (
        <TrailCardList data={allPosts} handleTagClick={handleTagClick} />
      )}
    </section>
  );
};

export default Feed;