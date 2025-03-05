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
    menuItems: MenuItemProps[];
    onMenuItemClick: (type: string, position: { x: number; y: number }) => void;
    mapItems: mapItem[];
}

const ImageZoomInOut: React.FC<ImageZoomInOutProps> = ({ imageUrl, menuItems, onMenuItemClick, mapItems}) => {

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({x:0,y:0});
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, items: menuItems});
    const [contextMenuPosition, setContextMenuPosition] = useState<{
        x: number;
        y: number;
      } | null>(null);

    const imageRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const positionRef = useRef(position);
    const scaleRef = useRef(scale);
    
    // Keep refs in sync with state
    useEffect(() => {
        positionRef.current = position;
    }, [position]);
    
    useEffect(() => {
        scaleRef.current = scale;
    }, [scale]);

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
            setContextMenu((menu) => ({ ...menu, visible: false }));
            
            //Difference between current and last position
            const deltaX = e.clientX - prevPosition.x;
            const deltaY = e.clientY - prevPosition.y;
            
            //Update last position
            prevPosition = {x: e.clientX, y: e.clientY};
            
            //Update current position
            setPosition((pos) => ({
                x: pos.x + deltaX,
                y: pos.y + deltaY,
            }));
        };

        const handleMouseRelease = () => {
            isDragging = false;
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            
            // Use current values from refs
            const currentPosition = positionRef.current;
            const currentScale = scaleRef.current;
        
            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
        
            // Calculate zoom factor based on scroll direction
            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
            const newScale = Math.max(0.1, currentScale * zoomFactor);
            
            // Calculate mouse position relative to image at current scale
            const mouseImageX = (mouseX - currentPosition.x) / currentScale;
            const mouseImageY = (mouseY - currentPosition.y) / currentScale;
            
            // Calculate new position that keeps the point under mouse fixed during zoom
            const newPosX = mouseX - mouseImageX * newScale;
            const newPosY = mouseY - mouseImageY * newScale;
            
            // Update state with new values
            setPosition({ x: newPosX, y: newPosY });
            setScale(newScale);
        };
        
        //Add event listeners
        container.addEventListener("mousedown", handleMouseDown);
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseup", handleMouseRelease);
        container.addEventListener('wheel', handleWheel);
        
        // Also catch mouse releases outside the container
        document.addEventListener("mouseup", handleMouseRelease);
        document.addEventListener("mouseleave", handleMouseRelease);
        
        return () => {
            //Clean up event listeners
            container.removeEventListener("mousedown", handleMouseDown);
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseup", handleMouseRelease);
            container.removeEventListener('wheel', handleWheel);
            document.removeEventListener("mouseup", handleMouseRelease);
            document.removeEventListener("mouseleave", handleMouseRelease);
        }   
    }, [imageRef, containerRef]); // Removed position and scale from dependencies

    // Guarantee that the view isn't zoomed out more than 10x
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
                            transform: 'translate(-50%, -50%)',
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