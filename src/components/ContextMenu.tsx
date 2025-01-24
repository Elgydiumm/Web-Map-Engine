import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface MenuItemProps {
    label: string;
    onClick: () => void;
}

interface BasicMenuProps {
    x: number;
    y: number;
    visible: boolean;
    menuItems: MenuItemProps[];
}

const BasicMenu: React.FC<BasicMenuProps> = ({ x, y, visible, menuItems }) => {
    if (!visible) return null;
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div style={{
            position: 'absolute',
            top: y-150,
            left: x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            borderRadius: '5px',
            zIndex: 1000,
        }}>
        <Button
            id="basic-button"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
        >
            Point of Interest
        </Button>
        <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {menuItems.map((item, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => {
                            item.onClick();
                            handleClose(); // Close the menu after clicking an item
                        }}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
    };

    export default BasicMenu;