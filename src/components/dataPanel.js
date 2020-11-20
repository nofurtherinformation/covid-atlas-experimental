import React, {useState} from 'react';
import { useSelector } from 'react-redux';

const DataPanel = (props) => {

  const [hidePanel, setHidePanel] = useState(true);
  const sidebarData = useSelector(state => state.sidebarData);

  console.log(sidebarData)

  return (
    <div id="data-panel" style={{transform: (hidePanel ? 'translateX(100%)' : '')}}>
      <h2>Data Sources &amp;<br/> Map Variables</h2>
      
      <button onClick={() => setHidePanel(prev => { return !prev })} id="showHideRightPanel" className={hidePanel ? 'hidden' : 'active'}>
        <svg version="1.1" x="0px" y="0px" viewBox="0 0 100 100">
          <g transform="translate(50 50) scale(0.69 0.69) rotate(0) translate(-50 -50)">
            <path d="M38,33.8L23.9,47.9c-1.2,1.2-1.2,3.1,0,4.2L38,66.2l4.2-4.2l-9-9H71v17c0,0.6-0.4,1-1,1H59v6h11
              c3.9,0,7-3.1,7-7V30c0-3.9-3.1-7-7-7H59v6h11c0.6,0,1,0.4,1,1v17H33.2l9-9L38,33.8z"/>
          </g>
        </svg>

      </button>
    </div>
  );
}

export default DataPanel;