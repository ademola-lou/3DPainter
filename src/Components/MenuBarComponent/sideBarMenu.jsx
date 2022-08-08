
import React, { useEffect } from 'react';
import { states } from '../../utils/state';

export function SideBarMenu(){

    useEffect(()=>{
  
    }, [])
    return (
        <div className="ui" style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50, -50)"
            // width: "100%"
        }}>
            {/* <div className="ui red small slider"></div> */}
            <input type="range" min="0" max="100" value="40" class="range range-secondary" orient="vertical"/>
        </div>

    )
}