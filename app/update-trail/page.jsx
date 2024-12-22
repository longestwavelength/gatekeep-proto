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
    tag: "",
    images: [],
  });
  const [submitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

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
        images: data.images || [],
      });
      setExistingImages(data.images || []);
    };

    if (trailId) getTrailDetails();
  }, [trailId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imageFiles.length + existingImages.length > 3) {
      setError("You can have a maximum of 3 images");
      return;
    }

    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSize = 3 * 1024 * 1024; // 3MB
      
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG and PNG are allowed.");
        return false;
      }
      
      if (file.size > maxSize) {
        setError("File size exceeds 3MB limit.");
        return false;
      }
      
      return true;
    });

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...validFiles]);
    setImagePreview(prev => [...prev, ...newPreviews]);
    setError("");
  };

  const removeNewImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    setImageFiles(newFiles);
    setImagePreview(newPreviews);
  };

  const removeExistingImage = async (imageUrl) => {
    try {
      const response = await fetch(`/api/trail/${trailId}/image`, {
        method: "DELETE",
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        setExistingImages(prev => prev.filter(img => img !== imageUrl));
      } else {
        setError("Failed to remove image");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      setError("Failed to remove image");
    }
  };

  const updateTrail = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!trailId) return alert("Missing TrailId!");

    try {
      const newImageUrls = await Promise.all(
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

          if (!response.ok) throw new Error('Failed to upload image');
          const data = await response.json();
          return data.secure_url;
        })
      );

      const allImages = [...existingImages, ...newImageUrls];

      const response = await fetch(`/api/trail/${trailId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: post.name,
          difficulty: post.difficulty,
          location: post.location,
          trailPath: post.trailPath,
          description: post.description,
          tag: post.tag,
          images: allImages,
        }),
      });

      if (response.ok) {
        imagePreview.forEach(URL.revokeObjectURL);
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to update trail");
    } finally {
      setIsSubmitting(false);
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
        type='Edit'
        post={post}
        setPost={setPost}
        submitting={submitting}
        handleSubmit={updateTrail}
        imageFiles={imageFiles}
        imagePreview={imagePreview}
        handleImageUpload={handleImageUpload}
        removeImage={removeNewImage}
        existingImages={existingImages}
        removeExistingImage={removeExistingImage}
      />
    </>
  );
};

const PageWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <UpdateTrail />
  </Suspense>
);
export default PageWrapper;