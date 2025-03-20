import React, { useState } from 'react'
import './App.css'
import ImageZoomInOut from './components/ImageZoomInOut';
import MarkerInfoPanel from './markers/MarkerInfoPanel';
import { handleMapItemClick } from './markers/MapItemClickParams';

interface mapItem {
  type: string;
  location: {x: number, y: number};
  id: string;
  clickable?: boolean;
}

function App() {
  const [map, setMap] = useState<string>('state');
  const [markers, setMarkers] = useState<mapItem[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  
  async function handleOnChange(e: React.FormEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement & {
      files: FileList;
    }
    setMap(URL.createObjectURL(target.files[0]));
  }

  const contextMenu = [
    { label: 'Town', onClick: () => {}},
    { label: 'City', onClick: () => {}},
    { label: 'Other', onClick: () => {}},
  ];

  function onMenuItemClick(type: string, position: { x: number; y: number }) {
    const newItem: mapItem = {
      id: `marker-${Date.now()}`,
      type: type,
      location: position,
      clickable: true
    };
    
    setMarkers((prevMarkers) => [...prevMarkers, newItem]);
    console.log(markers);
  }
  
  function onMapItemClick(itemId: string) {
    const item = markers.find(marker => marker.id === itemId);
    if (item) {
      setSelectedMarkerId(itemId);
      
      const result = handleMapItemClick({
        id: item.id,
        type: item.type,
        location: item.location
      });
      
      console.log('Handler returned:', result);
      }
  }
  
  const selectedMarker = markers.find(marker => marker.id === selectedMarkerId);

  return (
    <>
      <div className="map-container">
      <input type="file" name="image" onChange={handleOnChange}/> 
        <ImageZoomInOut
          imageUrl={map} 
          menuItems={contextMenu} 
          onMenuItemClick={onMenuItemClick} 
          mapItems={markers}
          onMapItemClick={onMapItemClick}
          selectedMarkerId={selectedMarkerId}
        />
        {selectedMarker && (
          <MarkerInfoPanel 
            id={selectedMarker.id}
            type={selectedMarker.type}
            location={selectedMarker.location}
            isVisible={!!selectedMarkerId}
          />
        )}
      </div>
    </>
  )
}

export default App