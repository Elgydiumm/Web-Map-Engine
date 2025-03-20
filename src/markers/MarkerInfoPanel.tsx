import React from 'react';

interface MarkerInfoProps {
  id: string;
  type: string;
  location: { x: number, y: number };
  isVisible: boolean;
}

const MarkerInfoPanel: React.FC<MarkerInfoProps> = ({ id, type, location, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="marker-info-panel">
      <h3>Selected Marker</h3>
      <div className="marker-details">
        <div className="info-row">
          <span className="label">Type:</span>
          <span className="value">{type}</span>
        </div>
        <div className="info-row">
          <span className="label">Position:</span>
          <span className="value">X: {Math.round(location.x)}, Y: {Math.round(location.y)}</span>
        </div>
        <div className="info-row">
          <span className="label">ID:</span>
          <span className="value">{id}</span>
        </div>
      </div>
    </div>
  );
};

export default MarkerInfoPanel;