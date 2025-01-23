import React, { useEffect, useRef, useState } from 'react'
import './ImageZoomInOut.css'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface ImageZoomInOutProps {
    imageUrl: string;
}

const ImageZoomInOut: React.FC<ImageZoomInOutProps> = ({ imageUrl }) => {

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({x:0,y:0});

    const imageRef = useRef<HTMLImageElement | null>(null);

    const handleZoomIn = () => {
        setScale((scale) => scale + 0.1);
    };
    const handleZoomOut = () => {
        setScale((prevScale) => Math.max(0.1, prevScale - 0.1));
        if (scale < 0.5) {
            setScale(0.5)
        }
    };

    useEffect(() => {
        const image = imageRef.current;
        if (!image) return;

        let isDragging = false;
        let prevPosition = {x:0,y:0};

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            prevPosition = {x: e.clientX, y: e.clientY};
        };
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaX = e.clientX - prevPosition.x;
            const deltaY = e.clientY - prevPosition.y;
            prevPosition = {x: e.clientX, y: e.clientY};
            setPosition((position) => ({
                x: position.x + deltaX,
                y: position.y + deltaY,
            }));
        };

        const handleMouseRelease = () => {
            isDragging = false;
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const rect = image.getBoundingClientRect();
            const mouseX = e.clientX - rect.left; // Mouse X position relative to the image
            const mouseY = e.clientY - rect.top; // Mouse Y position relative to the image

            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9; // Zoom in for scroll up, zoom out for scroll down
            const newScale = Math.max(0.5, scale * zoomFactor);

            const offsetX = (mouseX - rect.width / 2); // Offset from image center, adjusted for scale
            const offsetY = (mouseY - rect.height / 2);

            // Calculate the new position to keep the mouse as the zoom focus
            setPosition((prevPosition) => ({
                x: prevPosition.x - offsetX * (zoomFactor - 1),
                y: prevPosition.y - offsetY * (zoomFactor - 1),
            }));

            setScale(newScale);
        };
        
        image.addEventListener("mousedown", handleMouseDown);
        image.addEventListener("mousemove", handleMouseMove);
        image.addEventListener("mouseup", handleMouseRelease);
        image.addEventListener('wheel', handleWheel);
        return () => {
            image.removeEventListener("mousedown", handleMouseDown);
            image.removeEventListener("mousemove", handleMouseMove);
            image.removeEventListener("mouseup", handleMouseRelease);
            image.removeEventListener('wheel', handleWheel);
        }   
    }, [ imageRef, scale ]);

    if (scale < 0.5) {
        setScale(0.5)
    }

    return <div style={{backgroundColor: "#fffff", borderRadius: "10px", position: "relative", overflow: "hidden"}}>
        <div className="btn-container">
            <button onClick={handleZoomIn}>
                <AddIcon/>
            </button>
            <button onClick={handleZoomOut}>
                <RemoveIcon/>
            </button>
        </div>

        <img ref={imageRef} src={imageUrl} alt="" style={{width: "150vh", height: "auto", cursor: "grab", transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,}} draggable={false}/>
    </div>;
};

export default ImageZoomInOut