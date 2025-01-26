import React, { useState } from 'react'
import './App.css'
import ImageZoomInOut from './components/ImageZoomInOut';
import BasicMenu from './components/ContextMenu';

interface mapItem {
  type: string;
  location: {x: number, y: number};
}

function App() {

  const [map, setMap] = useState<string>('state'); // useState for storing the map file.
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [markers, setMarkers] = useState<mapItem[]>([]);
  
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
    setMarkers((prevMarkers) => [...prevMarkers, {type: type, location: position}]);
    console.log(markers);
  }
  return (
    <>
      <input type="file" name="image" onChange={handleOnChange}/> 
      <ImageZoomInOut imageUrl={map} menuItems={contextMenu} onMenuItemClick={onMenuItemClick} mapItems={markers}/>
    </>
  )
}

export default App
