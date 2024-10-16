"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TrailMap from '@components/TrailMap';

const TrailDetailPage = () => {
  const [trail, setTrail] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchTrailDetails = async () => {
      try {
        const response = await fetch(`/api/trail/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trail details');
        }
        const data = await response.json();
        setTrail(data);
      } catch (error) {
        console.error('Error fetching trail details:', error);
        // Handle error (e.g., show error message to user)
      }
    };

    if (id) {
      fetchTrailDetails();
    }
  }, [id]);

  if (!trail) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{trail.name}</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <p className="text-gray-600 mb-2">📍 {trail.location}</p>
        <p className="text-gray-600 mb-4">Difficulty: {trail.difficulty}</p>
        <p className="text-gray-700 mb-4">{trail.description}</p>
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
            #{trail.tag}
          </span>
        </div>
        <div className="h-96 mb-4">
          <TrailMap existingPath={trail.trailPath} readOnly={true} />
        </div>
      </div>
    </div>
  );
};

export default TrailDetailPage;