import React, { useState } from 'react'
import './App.css'
import ImageZoomInOut from './components/ImageZoomInOut';
import BasicMenu from './components/BasicMenu';

function App() {

  const [map, setMap] = useState<string>('state'); // useState for storing the map file.
  async function handleOnChange(e: React.FormEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement & {
      files: FileList;
    }
    setMap(URL.createObjectURL(target.files[0]));
  }
  const contextMenu = [
    { label: 'Town', onClick: () => alert('Town clicked!') },
    { label: 'City', onClick: () => alert('City clicked!') },
    { label: 'Other', onClick: () => alert('Other clicked!') },
];

  return (
    <>
      <input type="file" name="image" onChange={handleOnChange}/> 
      <ImageZoomInOut imageUrl={map} menuItems={contextMenu} BasicMenu={BasicMenu}/>
    </>
  )
}

export default App
