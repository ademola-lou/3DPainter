import React from 'react';
import { MenuBar } from './MenuBarComponent/menuBar';
import { ViewportRenderer } from './ViewportComponent/ViewportRenderer';
export default function App() {
    return(
        <div>
            <MenuBar></MenuBar>
            <ViewportRenderer></ViewportRenderer>
        </div>

    )
}