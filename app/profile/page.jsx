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
  const [isLoading, setIsLoading] = useState(false);

  const sectionOptions = ['Created Trails', 'Saved Trails', 'Completed Trails'];

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${session?.user.id}/posts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMyPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      // Consider adding an error state to show to users
      // setError("Failed to load trails. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookmarkedTrails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/trail/bookmark?userId=${session?.user.id}`);
      const data = await response.json();
      setBookmarkedTrails(data);
    } catch (error) {
      console.error("Failed to fetch bookmarked trails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompletedTrails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/trail/complete?userId=${session?.user.id}`);
      const data = await response.json();
      setCompletedTrails(data);
    } catch (error) {
      console.error("Failed to fetch completed trails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = async (section) => {
    setCurrentSection(section);

    if (section === 'Created Trails' && !myPosts.length) {
      await fetchPosts();
    } else if (section === 'Saved Trails' && !bookmarkedTrails.length) {
      await fetchBookmarkedTrails();
    } else if (section === 'Completed Trails' && !completedTrails.length) {
      await fetchCompletedTrails();
    }
  };

  const handleEdit = (post) => {
    router.push(`/update-trail?id=${post._id}`);
  };

  const handleDelete = async (post) => {
    const hasConfirmed = confirm("Are you sure you want to delete this trail?");

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

  const renderSection = () => {
    if (isLoading) {
      return <p>Loading...</p>;
    }

    switch (currentSection) {
      case 'Created Trails':
        return (
          <Profile
            name='Your'
            desc='Welcome to your profile page...'
            data={myPosts}
            handleEdit={handleEdit} // Pass handleEdit here
            handleDelete={handleDelete}
          />
        );
      case 'Saved Trails':
        return (
          <section className='w-full'>
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
          <section className='w-full'>
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

  useEffect(() => {
    if (session?.user.id) {
      fetchPosts(); // Fetch created trails when component mounts
    }
  }, [session]);

  return (
    <div>
      <div className="flex justify-end p-4">
        <ProfileSectionDropdown
          options={sectionOptions}
          selectedOption={currentSection}
          onOptionChange={handleSectionChange}
        />
      </div>

      {renderSection()}
    </div>
  );
};

export default MyProfile;


