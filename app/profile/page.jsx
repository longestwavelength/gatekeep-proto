"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Profile from "@components/Profile";
import TrailCard from "@components/TrailCard";

const MyProfile = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [myPosts, setMyPosts] = useState([]);
  const [bookmarkedTrails, setBookmarkedTrails] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch(`/api/users/${session?.user.id}/posts`);
      const data = await response.json();

      setMyPosts(data);
    };

    const fetchBookmarkedTrails = async () => {
      const response = await fetch(`/api/trail/bookmark?userId=${session?.user.id}`);
      const data = await response.json();

      setBookmarkedTrails(data);
    };

    if (session?.user.id){
      fetchPosts();
      fetchBookmarkedTrails();
    } 
  }, [session?.user.id]);

  const handleEdit = (post) => {
    router.push(`/update-trail?id=${post._id}`);
  };

  const handleDelete = async (post) => {
    const hasConfirmed = confirm(
      "Are you sure you want to delete this trail?"
    );

    if (hasConfirmed) {
      try {
        await fetch(`/api/trail/${post._id.toString()}`, {
          method: "DELETE",
        });

        const filteredPosts = myPosts.filter((item) => item._id !== post._id);

        setMyPosts(filteredPosts);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleRemoveBookmark = async (trail) => {
    try {
      await fetch('/api/trail/bookmark', {
        method: 'POST',
        body: JSON.stringify({
          trailId: trail._id,
          userId: session?.user.id
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const filteredBookmarks = bookmarkedTrails.filter(
        (item) => item._id !== trail._id
      );

      setBookmarkedTrails(filteredBookmarks);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {/* Created Trails Section*/}
      <Profile
      name='Your'
      desc='Welcome to your profile page...'
      data={myPosts}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
    />

    {/* Bookmarked Trails Section */}
    <section className='w-full mt-12'>
        <h1 className='head_text text-left'>
          <span className='blue_gradient'>Your Saved Trails</span>
        </h1>

        <div className="trail_container">
          <div className='mt-10 trail_layout'>
            {bookmarkedTrails.length > 0 ? (
              bookmarkedTrails.map((trail) => (
                <TrailCard
                  key={trail._id}
                  post={trail}
                  handleDelete={() => handleRemoveBookmark(trail)}
                />
              ))
            ) : (
              <p className="desc">No saved trails. Bookmark trails you want to try later!</p>
            )}
          </div>
        </div>
      </section>
    </div>
    
  );
};

export default MyProfile;