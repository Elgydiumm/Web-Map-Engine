import React, { useEffect, useRef, useState } from 'react'
import './ImageZoomInOut.css';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ContextMenu from './ContextMenu';
import markerImage from '../assets/marker.png';

interface MenuItemProps {
    label: string;
    onClick: () => void;
}
interface mapItem {
    type: string;
    location: {x: number, y: number};
}
  

interface ImageZoomInOutProps {
    imageUrl: string;
    //BasicMenu: React.FC<{ x: number; y: number; visible: boolean; menuItems: MenuItemProps[], onMenuItemClick: (label: string) => void; position: { x: number; y: number } | null;}>;
    menuItems: MenuItemProps[];
    onMenuItemClick: (type: string, position: { x: number; y: number }) => void;
    mapItems: mapItem[];
}

const ImageZoomInOut: React.FC<ImageZoomInOutProps> = ({ imageUrl, menuItems, onMenuItemClick, mapItems}) => {

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({x:0,y:0});
    const [contextMenu, setContextMenu] = useState({ visible: true, x: 0, y: 0, items: menuItems});
    const [contextMenuPosition, setContextMenuPosition] = useState<{
        x: number;
        y: number;
      } | null>(null);

    const imageRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleZoomIn = () => {
        setScale((scale) => scale + 0.1);
    };
    const handleZoomOut = () => {
        //Make sure you can't zoom out into the negative
        setScale((prevScale) => Math.max(0.1, prevScale - 0.1));
    };

    const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const image = imageRef.current;
        const container = containerRef.current;
        if (!image || !container) return;

        e.preventDefault(); // Prevent default context menu

        const containerRect = container.getBoundingClientRect();
        
        // Calculate click position relative to container
        const clickX = e.clientX - containerRect.left;
        const clickY = e.clientY - containerRect.top;
        
        // Convert to image coordinates (accounting for current scale and position)
        const imageX = (clickX - position.x) / scale;
        const imageY = (clickY - position.y) / scale;
        
        menuItems.forEach((item) => {
            item.onClick = () => onMenuItemClick(item.label, { x: imageX, y: imageY });
        });
        
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            items: menuItems,
        });
        
        setContextMenuPosition({ x: imageX, y: imageY });
    };

    useEffect(() => {
        const image = imageRef.current;
        const container = containerRef.current;
        if (!image || !container) return;

        let isDragging = false;
        let prevPosition = {x:0,y:0};

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            prevPosition = {x: e.clientX, y: e.clientY};
        };
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setContextMenu({ ...contextMenu, visible: false });
            //Difference between current and last position
            const deltaX = e.clientX - prevPosition.x;
            const deltaY = e.clientY - prevPosition.y;
            //Update last position
            prevPosition = {x: e.clientX, y: e.clientY};
            //Update current position
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

            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left; // Mouse X position relative to the container
            const mouseY = e.clientY - rect.top; // Mouse Y position relative to the container

            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9; // Zoom in for scroll up, zoom out for scroll down
            const newScale = Math.max(0.1, scale * zoomFactor); // Calculate new scaling make sure you can't zoom out more than 0.1
            
            // Calculate the position of the mouse relative to the image in image coordinates
            const mouseImageX = (mouseX - position.x) / scale;
            const mouseImageY = (mouseY - position.y) / scale;
            
            // After zoom, calculate where the new position should be to keep mouse point fixed
            const newX = mouseX - mouseImageX * newScale;
            const newY = mouseY - mouseImageY * newScale;
            
            setPosition({ x: newX, y: newY });
            setScale(newScale);
        };
        
        //Add event listeners
        container.addEventListener("mousedown", handleMouseDown);
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseup", handleMouseRelease);
        container.addEventListener('wheel', handleWheel);
        return () => {
            //Clean up event listeners
            container.removeEventListener("mousedown", handleMouseDown);
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseup", handleMouseRelease);
            container.removeEventListener('wheel', handleWheel);
        }   
    }, [ imageRef, containerRef, scale ]);

    // Gurantee that the view isn't zoomed out more than 10x
    if (scale < 0.1) {
        setScale(0.1)
    }

    return (
        <div 
            ref={containerRef}
            style={{
                backgroundColor: "#302f2f", 
                borderRadius: "10px", 
                position: "relative", 
                overflow: "hidden", 
                height: "80vh", 
                width: "100%"
            }} 
            onContextMenu={handleRightClick}
        >
            <div className="btn-container">
                <button onClick={handleZoomIn}><AddIcon/></button>
                <button onClick={handleZoomOut}><RemoveIcon/></button>
                <ul>
                    {mapItems.map((item, index) => (
                        <li key={index}>{item.type} | {Math.round(item.location.x)} {Math.round(item.location.y)}</li>
                    ))}
                </ul>
            </div>

            <div style={{
                position: "relative",
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: '0 0',
                width: 'fit-content',
                height: 'fit-content'
            }}>
                <img 
                    ref={imageRef} 
                    src={imageUrl} 
                    alt="" 
                    style={{width: "150vh", height: "auto", cursor: "grab"}} 
                    draggable={false}
                />
                
                {mapItems.map((item, index) => (
                    <img
                        key={index}
                        src={markerImage}
                        style={{
                            position: 'absolute',
                            left: `${item.location.x}px`,
                            top: `${item.location.y}px`,
                            transform: 'translate(-50%, -50%)', // Center the marker on the point
                            width: '24px',
                            height: '24px',
                            zIndex: 1000,
                        }}
                        alt={item.type}
                        draggable={false}
                    />
                ))}
            </div>
            
            <ContextMenu 
                x={contextMenu.x}
                y={contextMenu.y}
                visible={contextMenu.visible}
                menuItems={contextMenu.items}
                onMenuItemClick={(label) => {
                    if (contextMenuPosition) onMenuItemClick(label, contextMenuPosition);
                }}
                position={contextMenuPosition}
            />
        </div>
    );
};

export default ImageZoomInOut