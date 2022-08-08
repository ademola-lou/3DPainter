import React from 'react';
import { FootMenuBar } from './MenuBarComponent/footMenuBar';
import { MenuBar } from './MenuBarComponent/menuBar';
import { SideBarMenu } from './MenuBarComponent/sideBarMenu';
import { ViewportRenderer } from './ViewportComponent/ViewportRenderer';
export default function App() {
    return(
        <div>
            <MenuBar></MenuBar>
            <ViewportRenderer></ViewportRenderer>
            <FootMenuBar></FootMenuBar>

        </div>

    )
}