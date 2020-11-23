import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Popper from '@material-ui/core/Popper';
import { tooltipInfo } from '../config';
import { setAnchorEl } from '../actions';

const Popover = () => {

    const dispatch = useDispatch();

    const anchorEl = useSelector(state => state.anchorEl);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;
    
    const handleMouseOver = (event) => {
        dispatch(setAnchorEl(anchorEl))
    }

    const handleMouseLeave = () => {
        dispatch(setAnchorEl(null))
    }
    
    return (
        <Popper 
            id={id} 
            open={open} 
            anchorEl={anchorEl}
            placement="left"
            disablePortal={false}
            modifiers={{
                flip: {
                enabled: true,
                },
                preventOverflow: {
                enabled: true,
                boundariesElement: 'scrollParent',
                }
            }}
            style={{ 
                zIndex:10000,
                maxWidth:'200px',
                background:'none',
                padding:0,
                margin:0,
                pointerEvents: 'none'
            }}
            onMouseEnter={handleMouseOver} 
            onMouseLeave={handleMouseLeave}
            >
            <div style={{
                background:'black',
                padding:'1px 10px',
                margin:0,
                borderRadius: '4px',
                color:'white',
                transform:'translateX(65%)',
                boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
                pointerEvents: 'all'
                }}
                >
                {anchorEl && tooltipInfo[anchorEl.id]}
            </div>
        </Popper>
    )
}

export default Popover