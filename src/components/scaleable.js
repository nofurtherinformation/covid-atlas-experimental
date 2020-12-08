import React, { useState } from 'react';
import styled from 'styled-components'

const ResizeButton = styled.button`
    float:right;
    background:none;
    outline:none;
    border:none;
    transform: rotate(90deg);
`

const Scaleable = (props) => {
    const [width, setWidth] = useState(props.defaultWidth);
    const [height, setHeight] = useState(props.defaultHeight);
    const [dragging, setDragging] = useState(false);

    const listener = (e) => {
        setWidth(prevWidth => prevWidth+e.movementX)
        setHeight(prevHeight => prevHeight+e.movementY)
    }

    const removeListener = () => {
        window.removeEventListener('mousemove', listener)
        window.removeEventListener('mouseup', removeListener)
    }
    
    const handleDown = () => {
        setDragging(true)
        window.addEventListener('mousemove', listener)
        window.addEventListener('mouseup', removeListener)
    }

    return (
        <div style={{width: width, height: height, minHeight: props.minHeight, minWidth: props.minWidth}}>
            {props.content}
            <ResizeButton 
                id="resize"
                onMouseDown={handleDown}
                style={{zIndex:10}}
            >
                <svg height='20px' width='20px'  fill="#ffffff" viewBox="0 0 8.4666667 8.4666667" x="0px" y="0px"><g transform="translate(0,-288.53333)"><path d="m 5.5562495,289.59166 v 0.52916 h 0.94878 l -1.665015,1.66502 0.3741367,0.37414 1.665015,-1.66502 v 0.94878 h 0.5291667 v -1.85208 z m -2.303735,3.78168 -1.665015,1.66501 v -0.94878 H 1.0583328 v 1.85209 h 1.8520834 v -0.52917 h -0.94878 l 1.665015,-1.66501 z"></path></g></svg>
            </ResizeButton>
        </div>
    )
}

export default Scaleable;