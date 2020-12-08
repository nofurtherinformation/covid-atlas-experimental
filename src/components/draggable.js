import React, { useState } from 'react';
import styled from 'styled-components'

const DragContainer = styled.div`
    position:fixed;
    background:#2b2b2b;
    padding:20px 20px 0 20px;
    box-sizing: border-box;
    box-shadow: 0px 0px 5px rgba(0,0,0,0.7);
    border-radius: 0.5vh;
    &.collapsed {
        width:100px;
        height:40px;
        overflow:hidden;
        padding:0;
        div {
            display:none;
        }
    }
`
const DragButton = styled.button`
    position:absolute;
    left:0;
    top:5px;
    background:none;
    outline:none;
    border:none;
    svg {
        fill:white;
        width:20px;
        height:20px;
    }
`


const CollapseButton = styled.button`
    position: absolute;
    top: 3px;
    right: 5px;
    font-size: 200%;
    cursor: pointer;
    padding:0;
    background:none;
    outline:none;
    border:none;
    color:white;
    p {
        font-size:50%;
        display:inline;
        font-family:'Montserrat', sans-serif;
        line-height:1;
    }
    svg {
        fill:white;
        width:40px;
        height:30px;
    }
`

const Draggable = (props) => {
    const [X, setX] = useState(props.defaultX);
    const [Y, setY] = useState(props.defaultY);
    const [collapsed, setCollapsed] = useState(false);

    const listener = (e) => {
        setX(prevWidth => prevWidth+e.movementX)
        setY(prevHeight => prevHeight+e.movementY)
    }

    const removeListener = () => {
        window.removeEventListener('mousemove', listener)
        window.removeEventListener('mouseup', removeListener)
    }
    
    const handleDown = () => {
        window.addEventListener('mousemove', listener)
        window.addEventListener('mouseup', removeListener)
    }

    const handleCollapse = () => {
        if (collapsed) {
            setCollapsed(false)
        } else {
            setCollapsed(true)
        }
    }

    return (
        <DragContainer style={{left:`${X}px`, top: `${Y}px`}} className={collapsed ? 'collapsed' : ''}>
            {props.content}
            <DragButton 
                id="resize"
                onMouseDown={handleDown}
                style={{zIndex:10}}
            >
                <svg viewBox="0 0 64 64" x="0px" y="0px"><g><path d="M53.39,32.57a1.52,1.52,0,0,0-.33-1.63l-5.84-5.85a1.51,1.51,0,0,0-2.13,2.13l3.29,3.28H33.5V15.62l3.28,3.29a1.51,1.51,0,0,0,2.13-2.13l-5.85-5.84a1.5,1.5,0,0,0-2.12,0l-5.85,5.84a1.51,1.51,0,0,0,2.13,2.13l3.28-3.29V30.5H15.62l3.29-3.28a1.51,1.51,0,0,0-2.13-2.13l-5.84,5.85a1.5,1.5,0,0,0,0,2.12l5.84,5.85a1.51,1.51,0,0,0,2.13-2.13L15.62,33.5H30.5V48.38l-3.28-3.29a1.51,1.51,0,0,0-2.13,2.13l5.85,5.84a1.5,1.5,0,0,0,2.12,0l5.85-5.84a1.51,1.51,0,0,0-2.13-2.13L33.5,48.38V33.5H48.38l-3.29,3.28a1.51,1.51,0,0,0,2.13,2.13l5.84-5.85A1.51,1.51,0,0,0,53.39,32.57Z"></path></g></svg>
            </DragButton>
            <CollapseButton onClick={handleCollapse}>
                {!collapsed && '×'}
                {collapsed && <p>{props.title}</p>}
            </CollapseButton>
        </DragContainer>
    )
}

export default Draggable;