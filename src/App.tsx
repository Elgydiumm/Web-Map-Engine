import React, { useState } from 'react'
import './App.css'
import ImageZoomInOut from './components/ImageZoomInOut';

function App() {

  const [map, setMap] = useState<string>('state'); // useState for storing the map file.
  async function handleOnChange(e: React.FormEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement & {
      files: FileList;
    }
    setMap(URL.createObjectURL(target.files[0]));
  }

  return (
    <>
      <input type="file" name="image" onChange={handleOnChange}/> 
      <ImageZoomInOut imageUrl={map}/>
    </>
  )
}

export default App
