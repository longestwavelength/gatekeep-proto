"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Form from "@components/Form";

const CreateTrail = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [post, setPost] = useState({
    name: "",
    difficulty: "",
    location: "",
    description: "",
    tag: "",
    trailPath: {
      type: "LineString",
      coordinates: []
    },
  });

  const createTrail = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const requestBody = {
      name: post.name,
      userId: session?.user.id,
      difficulty: post.difficulty,
      location: post.location,
      trailPath: post.trailPath,
      description: post.description,
      tag: post.tag,
    };

    console.log('Sending request with body:', requestBody);

    try {
      const response = await fetch("/api/trail/new", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Received response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create trail');
      }

      router.push("/");
    } catch (error) {
      setError(error.message || "Failed to create trail");
      console.error('Error creating trail:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <Form
        type="Create"
        post={post}
        setPost={setPost}
        submitting={submitting}
        handleSubmit={createTrail}
      />
    </>
  );
};

export default CreateTrail;