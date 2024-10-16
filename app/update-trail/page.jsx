"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Form from "@components/Form";

const UpdateTrail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trailId = searchParams.get("id");

  const [post, setPost] = useState({ 
    name: "", 
    difficulty: "", 
    location: "",
    trailPath: {
      type: "LineString",
      coordinates: []
    },
    description: "",
    tag: "", });
  const [submitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getTrailDetails = async () => {
      const response = await fetch(`/api/trail/${trailId}`);
      const data = await response.json();

      setPost({
        name: data.name,
        difficulty: data.difficulty,
        location: data.location,
        trailPath: data.trailPath || { type: "LineString", coordinates: [] },
        description: data.description,
        tag: data.tag,
      });
    };

    if (trailId) getTrailDetails();
  }, [trailId]);

  const updateTrail = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!trailId) return alert("Missing TrailId!");

    try {
      const response = await fetch(`/api/trail/${trailId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: post.name,
          difficulty: post.difficulty,
          location: post.location,
          trailPath: post.trailPath,
          description: post.description,
          tag: post.tag,
        }),
      });

      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      type='Edit'
      post={post}
      setPost={setPost}
      submitting={submitting}
      handleSubmit={updateTrail}
    />
  );
};

// Wrap the UpdateTrail component with a Suspense boundary
const PageWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <UpdateTrail />
  </Suspense>
);

export default PageWrapper;