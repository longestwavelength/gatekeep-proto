
"use client"

import { Download } from 'lucide-react';

const GPXDownload = ({ trailName, trailPath, elevationData }) => {
  const createGPXContent = () => {
    if (!trailPath || !trailPath.coordinates || trailPath.coordinates.length === 0) {
      throw new Error('No trail coordinates available');
    }

    const date = new Date().toISOString();
    
    // Convert coordinates and combine with elevation data
    const coordinates = trailPath.coordinates.map((coord, index) => ({
      lat: coord[1],
      lon: coord[0],
      ele: elevationData ? elevationData[index]?.elevation || 0 : 0
    }));
    
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Gatekeep"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${trailName}</name>
    <time>${date}</time>
  </metadata>
  <trk>
    <name>${trailName}</name>
    <trkseg>
      ${coordinates.map(coord => 
        `      <trkpt lat="${coord.lat}" lon="${coord.lon}">
        <ele>${coord.ele}</ele>
      </trkpt>`
      ).join('\n')}
    </trkseg>
  </trk>
</gpx>`;
    
    return gpx;
  };

  const downloadGPX = () => {
    try {
      const gpxContent = createGPXContent();
      const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${trailName.toLowerCase().replace(/\s+/g, '-')}.gpx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating GPX file:', error);
      alert('Failed to create GPX file. Please ensure the trail has valid coordinates.');
    }
  };

  return (
    <button
      onClick={downloadGPX}
      disabled={!trailPath?.coordinates?.length}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors duration-200
        ${!trailPath?.coordinates?.length 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      <Download className="w-4 h-4" />
      Download GPX Data
    </button>
  );
};

export default GPXDownload;