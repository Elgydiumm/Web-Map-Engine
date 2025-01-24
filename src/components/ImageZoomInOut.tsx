import React, { useEffect, useRef, useState } from 'react'
import './ImageZoomInOut.css';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import BasicMenu from './ContextMenu';

interface MenuItemProps {
    label: string;
    onClick: () => void;
}

interface ImageZoomInOutProps {
    imageUrl: string;
    BasicMenu: React.FC<{ x: number; y: number; visible: boolean, menuItems: MenuItemProps[]}>;
    menuItems: MenuItemProps[];
}

const ImageZoomInOut: React.FC<ImageZoomInOutProps> = ({ imageUrl, menuItems }) => {

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({x:0,y:0});
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, items: menuItems});

    const imageRef = useRef<HTMLImageElement | null>(null);

    const handleZoomIn = () => {
        setScale((scale) => scale + 0.1);
    };
    const handleZoomOut = () => {
        //Make sure you can't zoom out into the negative
        setScale((prevScale) => Math.max(0.1, prevScale - 0.1));
    };

    const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevent default context menu
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            items: contextMenu.items,
        });
    };

    useEffect(() => {
        const image = imageRef.current;
        if (!image) return;

        let isDragging = false;
        let prevPosition = {x:0,y:0};

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            setContextMenu({ ...contextMenu, visible: false });
            prevPosition = {x: e.clientX, y: e.clientY};
        };
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
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
            const newScale = Math.max(0.5, scale * zoomFactor); // Calculate new scaling make sure you can't zoom out more than 0.5
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
        image.addEventListener("mousedown", handleMouseDown);
        image.addEventListener("mousemove", handleMouseMove);
        image.addEventListener("mouseup", handleMouseRelease);
        image.addEventListener('wheel', handleWheel);
        return () => {
            //Clean up event listeners
            image.removeEventListener("mousedown", handleMouseDown);
            image.removeEventListener("mousemove", handleMouseMove);
            image.removeEventListener("mouseup", handleMouseRelease);
            image.removeEventListener('wheel', handleWheel);
        }   
    }, [ imageRef, scale ]);

    // Gurantee that the view isn't zoomed out more than 0.5
    if (scale < 0.5) {
        setScale(0.5)
    }

    return <div style={{backgroundColor: "#302f2f", borderRadius: "10px", position: "relative", overflow: "hidden"}} onContextMenu={handleRightClick}>
        <div className="btn-container">
            <button onClick={handleZoomIn}>
                <AddIcon/>
            </button>
            <button onClick={handleZoomOut}>
                <RemoveIcon/>
            </button>
        </div>

        <img ref={imageRef} src={imageUrl} alt="" style={{width: "150vh", height: "auto", cursor: "grab", transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,}} draggable={false}/>
        <BasicMenu x={contextMenu.x} y={contextMenu.y} visible={contextMenu.visible} menuItems={contextMenu.items} />
    </div>;
};

export default ImageZoomInOut