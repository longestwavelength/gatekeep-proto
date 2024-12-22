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
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 3 images
    if (files.length + imageFiles.length > 3) {
      setError("You can upload a maximum of 3 images");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSize = 3 * 1024 * 1024; // 3MB
      
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG, and PNG are allowed.");
        return false;
      }
      
      if (file.size > maxSize) {
        setError("File size exceeds 3MB limit.");
        return false;
      }
      
      return true;
    });

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...validFiles]);
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    setImageFiles(newFiles);
    setImagePreview(newPreviews);
  };

  const createTrail = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
        // Upload images to Cloudinary first
        const imageUrls = await Promise.all(
            imageFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, 
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                return data.secure_url;
            })
        );

        // Now create the trail with the image URLs
        const requestBody = {
            name: post.name,
            userId: session?.user.id,
            difficulty: post.difficulty,
            location: post.location,
            trailPath: post.trailPath,
            description: post.description,
            tag: post.tag,
            images: imageUrls, // Add the URLs here
        };

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

        // Clean up preview URLs
        imagePreview.forEach(URL.revokeObjectURL);

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
        imageFiles={imageFiles}
        imagePreview={imagePreview}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
      />
    </>
  );
};

export default CreateTrail;