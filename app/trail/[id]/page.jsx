"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TrailMap from '@components/TrailMap';
import GPXDownload from '@components/GPXDownload';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';

const TrailDetailPage = () => {
  const [trail, setTrail] = useState(null);
  const [elevationData, setElevationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchTrailDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/trail/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trail details');
        }
        const data = await response.json();
        setTrail(data);
        
        // Fetch elevation data for the trail coordinates
        if (data.trailPath?.coordinates) {
          const elevations = await fetchElevationData(data.trailPath.coordinates);
          setElevationData(elevations);
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
    try {
      // Using the Open-Elevation API
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
      
      // Process elevation data for chart
      return data.results.map((result, index) => ({
        distance: index * 0.1, // Approximate distance in km
        elevation: result.elevation,
        lat: result.latitude,
        lng: result.longitude
      }));
    } catch (error) {
      console.error('Error fetching elevation data:', error);
      throw new Error('Unable to fetch elevation data. Please try again later.');
    }
  };

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
        
        {/* Elevation Chart */}
        {elevationData ? (
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
        ) : (
          <div className="mt-6 mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Elevation data unavailable</p>
          </div>
        )}

        {/* Stats Summary */}
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
        <div className="mt-4">
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