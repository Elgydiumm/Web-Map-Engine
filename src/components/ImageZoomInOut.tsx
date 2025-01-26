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

    const handleZoomIn = () => {
        setScale((scale) => scale + 0.1);
    };
    const handleZoomOut = () => {
        //Make sure you can't zoom out into the negative
        setScale((prevScale) => Math.max(0.1, prevScale - 0.1));
    };

    const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const image = imageRef.current;
        if (!image) return;
        const rect = image.getBoundingClientRect();
        e.preventDefault(); // Prevent default context menu
        menuItems.forEach((item) => {
            item.onClick = () => onMenuItemClick(item.label, position);
        });
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            items: contextMenu.items,
        });
        const position = { x: (e.clientX - rect.width / 2), y: (e.clientY - rect.height / 2) };
        setContextMenuPosition(position);
    };

    useEffect(() => {
        const image = imageRef.current;
        if (!image) return;
        const container = image.parentElement;
        if (!container) return;

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

            const rect = image.getBoundingClientRect();
            const mouseX = e.clientX - rect.left; // Mouse X position relative to the image
            const mouseY = e.clientY - rect.top; // Mouse Y position relative to the image

            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9; // Zoom in for scroll up, zoom out for scroll down
            const newScale = Math.max(0.1, scale * zoomFactor); // Calculate new scaling make sure you can't zoom out more than 0.5
            const offsetX = (mouseX - rect.width / 2); // Offset from image center, adjusted for scale
            const offsetY = (mouseY - rect.height / 2);

            // Calculate the new position to keep the mouse as the zoom focus
            setPosition((prevPosition) => ({
                x: prevPosition.x - offsetX * (zoomFactor - 1),
                y: prevPosition.y - offsetY * (zoomFactor - 1),
            }));

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
    }, [ imageRef, scale ]);

    // Gurantee that the view isn't zoomed out more than 10x
    if (scale < 0.1) {
        setScale(0.1)
    }

    return <div style={{backgroundColor: "#302f2f", borderRadius: "10px", position: "relative", overflow: "hidden"}} onContextMenu={handleRightClick}>
        <div className="btn-container">
            <button onClick={handleZoomIn}>
                {position.x}
                /
                {position.y}
                <AddIcon/>
            </button>
            <button onClick={handleZoomOut}>
                <RemoveIcon/>
            </button>
            <ul>
                {mapItems.map((item, index) => (
                    <li key={index}>{item.type} | {item.location.x} {item.location.y}</li>
                 ))}
            </ul>
        </div>

        {mapItems.map((item, index) => {
                const image = imageRef.current;
                if (!image) return;
                //const scaledX = item.location.x + position.x;
                //const scaledY = item.location.y + position.y;
                const scaledX = (item.location.x - position.x) * scale
                const scaledY = (item.location.y - position.y) * scale 

                return (
                    <img
                        key={index}
                        src={markerImage}
                        style={{
                            position: 'absolute',
                            transform: `translate(${scaledX}px, ${scaledY}px) scale(${scale})`,
                            zIndex: 10000,
                        }}
                        draggable={false}
                    />
                );
            })}
        <img ref={imageRef} src={imageUrl} alt="" style={{position: "relative", width: "150vh", height: "auto", cursor: "grab", transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,}} draggable={false}/>
        <ContextMenu x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        menuItems={contextMenu.items}
        onMenuItemClick={(label) => {
            if (contextMenuPosition) {
              onMenuItemClick(label, contextMenuPosition);
            }
          }}
        position={contextMenuPosition}
          
          />
    </div>;
};

export default ImageZoomInOut