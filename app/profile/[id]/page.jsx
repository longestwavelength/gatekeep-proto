"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Profile from "@components/Profile";

const UserProfilePage = () => {
  const { id } = useParams();
  const [userPosts, setUserPosts] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await fetch(`/api/users/${id}/posts`);
        const data = await response.json();
        setUserPosts(data);
        if (data.length > 0) {
          setUserName(data[0].creator.username);
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };

    if (id) fetchUserPosts();
  }, [id]);

  return (
    <Profile
      name={userName}
      desc={`Welcome to ${userName}'s profile page. Explore ${userName}'s amazing trails and experiences.`}
      data={userPosts}
    />
  );
};

export default UserProfilePage;