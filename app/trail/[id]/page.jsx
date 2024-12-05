"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import TrailMap from '@components/TrailMap';
import GPXDownload from '@components/GPXDownload';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Bookmark, BookmarkCheck, MoreVertical, CheckCircle2 } from 'lucide-react';


const TrailDetailPage = () => {
  const { data: session } = useSession();
  const [trail, setTrail] = useState(null);
  const [elevationData, setElevationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [elevationError, setElevationError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchTrailDetails = async () => {
      setIsLoading(true);
      setError(null);
      setElevationError(null);
      
      try {
        // First fetch basic trail details
        const response = await fetch(`/api/trail/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trail details');
        }
        const data = await response.json();
        setTrail(data);
        
        // Then fetch elevation data separately
        if (data.trailPath?.coordinates) {
          try {
            const elevations = await fetchElevationData(data.trailPath.coordinates);
            setElevationData(elevations);
          } catch (elevationErr) {
            console.error('Error fetching elevation data:', elevationErr);
            setElevationError('Unable to fetch elevation data. Please try again later.');
            // Don't throw here - we want to continue showing the trail data
          }
        }
      } catch (error) {
        console.error('Error fetching trail details:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTrailDetails();
    }
  }, [id]);

  const fetchElevationData = async (coordinates) => {
    const points = coordinates.map(coord => ({
      latitude: coord[1],
      longitude: coord[0]
    }));

    const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locations: points }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch elevation data');
    }

    const data = await response.json();
    
    return data.results.map((result, index) => ({
      distance: index * 0.1, // Approximate distance in km
      elevation: result.elevation,
      lat: result.latitude,
      lng: result.longitude
    }));
  };

  // method to handle bookmarking
  const handleBookmark = async () => {
    if (!session?.user) {
      alert('Please log in to bookmark trails');
      return;
    }

    try {
      const response = await fetch('/api/trail/bookmark', {
        method: 'POST',
        body: JSON.stringify({
          trailId: id,
          userId: session.user.id
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error('Error bookmarking trail:', error);
      alert('Failed to bookmark trail');
    }
  };

  // New method to handle marking trail as completed
  const handleMarkCompleted = async () => {
    if (!session?.user) {
      alert('Please log in to mark trails as completed');
      return;
    }

    try {
      const response = await fetch('/api/trail/complete', {
        method: 'POST',
        body: JSON.stringify({
          trailId: id,
          userId: session.user.id
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsCompleted(data.isCompleted);
      }
    } catch (error) {
      console.error('Error marking trail as completed:', error);
      alert('Failed to mark trail as completed');
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuAction = (action) => {
    if (action === 'bookmark') {
      handleBookmark();
    } else if (action === 'complete') {
      handleMarkCompleted();
    }
    setIsDropdownOpen(false);
  };

  // Check bookmark and completed status when trail loads
  useEffect(() => {
    const checkTrailStatus = async () => {
      if (trail && session?.user) {
        try {
          const bookmarkResponse = await fetch(`/api/trail/bookmark?userId=${session.user.id}`);
          const bookmarkedTrails = await bookmarkResponse.json();
          
          const completedResponse = await fetch(`/api/trail/complete?userId=${session.user.id}`);
          const completedTrails = await completedResponse.json();
          
          setIsBookmarked(
            bookmarkedTrails.some(bookmarkedTrail => bookmarkedTrail._id === id)
          );
          
          setIsCompleted(
            completedTrails.some(completedTrail => completedTrail._id === id)
          );
        } catch (error) {
          console.error('Error checking trail status:', error);
        }
      }
    };

    checkTrailStatus();
  }, [trail, session, id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500 w-5 h-5" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">Trail not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className='text-3xl font-bold'>
          {trail.name}
        </h1>
        {session?.user && trail.creator && trail.creator._id.toString() !== session.user.id && (
          <div className="relative">
            <button 
              onClick={toggleDropdown} 
              className="hover:bg-gray-100 p-2 rounded-full"
            >
              <MoreVertical />
            </button>
    
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                <div 
                  onClick={() => handleMenuAction('bookmark')} 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="text-blue-600" /> Saved
                    </>
                  ) : (
                    <>
                      <Bookmark /> Save
                    </>
                  )}
                </div>
                <div 
                  onClick={() => handleMenuAction('complete')} 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="text-green-600" /> Completed
                    </>
                  ) : (
                    <>
                      <CheckCircle2 /> Mark as Completed
                    </>
                  )}
                </div>
              </div>
            )}
        </div>
        )}
      </div>
      {/* Show elevation error if present */}
      {elevationError && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-yellow-500 w-5 h-5" />
          <p className="text-yellow-700">{elevationError}</p>
        </div>
      )}

      {/* <h1 className="text-3xl font-bold mb-4">{trail.name}</h1> */}
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
        
        {/* Elevation Chart - Only show if data is available */}
        {elevationData && (
          <div className="mt-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Elevation Profile</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={elevationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="distance" 
                    label={{ value: 'Distance (km)', position: 'bottom' }}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Elevation (m)', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}m`, 'Elevation']}
                    labelFormatter={(value) => `Distance: ${value}km`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="elevation" 
                    stroke="#2563eb" 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Stats Summary - Only show if elevation data is available */}
        {elevationData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm text-gray-600">Max Elevation</h4>
              <p className="text-xl font-semibold">
                {Math.max(...elevationData.map(d => d.elevation))}m
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm text-gray-600">Min Elevation</h4>
              <p className="text-xl font-semibold">
                {Math.min(...elevationData.map(d => d.elevation))}m
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm text-gray-600">Total Ascent</h4>
              <p className="text-xl font-semibold">
                {elevationData.reduce((acc, curr, i, arr) => {
                  if (i === 0) return acc;
                  const gain = Math.max(0, curr.elevation - arr[i-1].elevation);
                  return acc + gain;
                }, 0).toFixed(0)}m
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm text-gray-600">Total Descent</h4>
              <p className="text-xl font-semibold">
                {elevationData.reduce((acc, curr, i, arr) => {
                  if (i === 0) return acc;
                  const gain = Math.max(0, arr[i-1].elevation - curr.elevation);
                  return acc + gain;
                }, 0).toFixed(0)}m
              </p>
            </div>
          </div>
        )}

        {/* Download Button */}
        <div className="mt-6 py-4">
          <GPXDownload 
            trailName={trail.name}
            trailPath={trail.trailPath}
            elevationData={elevationData}
          />
        </div>
      </div>
    </div>
  );
};

export default TrailDetailPage;