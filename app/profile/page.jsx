"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Profile from "@components/Profile";
import TrailCard from "@components/TrailCard";
import ProfileSectionDropdown from "@components/ProfileSectionDropdown";

const MyProfile = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [myPosts, setMyPosts] = useState([]);
  const [bookmarkedTrails, setBookmarkedTrails] = useState([]);
  const [completedTrails, setCompletedTrails] = useState([]);

  const [currentSection, setCurrentSection] = useState('Created Trails');
  const sectionOptions = ['Created Trails', 'Saved Trails', 'Completed Trails'];

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [postsRes, bookmarksRes, completedRes] = await Promise.all([
          fetch(`/api/users/${session?.user.id}/posts`),
          fetch(`/api/trail/bookmark?userId=${session?.user.id}`),
          fetch(`/api/trail/complete?userId=${session?.user.id}`)
        ]);

        const [postsData, bookmarksData, completedData] = await Promise.all([
          postsRes.json(),
          bookmarksRes.json(),
          completedRes.json()
        ]);

        setMyPosts(postsData);
        setBookmarkedTrails(bookmarksData);
        setCompletedTrails(completedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user.id) {
      fetchData();
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

  const handleRemoveCompleted = async (trail) => {
    try {
      await fetch('/api/trail/complete', {
        method: 'POST',
        body: JSON.stringify({
          trailId: trail._id,
          userId: session?.user.id
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const filteredCompleted = completedTrails.filter(
        (item) => item._id !== trail._id
      );

      setCompletedTrails(filteredCompleted);
    } catch (error) {
      console.log(error);
    }
  };

  const renderSection = () => {
    if (isLoading) {
      return <p className="desc text-center mt-10">Loading...</p>;
    }
    
    switch(currentSection) {
      case 'Created Trails':
        return (
          <Profile
            name='Your'
            desc='Welcome to your profile page...'
            data={myPosts}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        );
      case 'Saved Trails':
        return (
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
        );
      case 'Completed Trails':
        return (
          <section className='w-full mt-12'>
            <h1 className='head_text text-left'>
              <span className='blue_gradient'>Completed Trails</span>
            </h1>

            <div className="trail_container">
              <div className='mt-10 trail_layout'>
                {completedTrails.length > 0 ? (
                  completedTrails.map((trail) => (
                    <TrailCard
                      key={trail._id}
                      post={trail}
                      handleDelete={() => handleRemoveCompleted(trail)}
                    />
                  ))
                ) : (
                  <p className="desc">No completed trails. Start exploring and mark trails as completed!</p>
                )}
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Dropdown for section selection */}
      <div className="flex justify-end p-4">
        <ProfileSectionDropdown 
          options={sectionOptions}
          selectedOption={currentSection}
          onOptionChange={setCurrentSection}
        />
      </div>

      {/* Dynamic section rendering */}
      {renderSection()}
    </div>
  );
};

export default MyProfile;