import React, { useEffect } from 'react';
import { applyBrushSettings, BRUSH_SETTINGS } from '../../utils/brushesSetting';
import { states } from '../../utils/state';

export function MenuBar(){
function enableEraser(ev){
    states.eraserEnabled = !states.eraserEnabled;
    ev.target.style.color = !states.eraserEnabled ? "white" : "red";
    document.dispatchEvent(new CustomEvent("eraseColor"));
}

    const file_dom = React.createRef();
    let file_opener;
    
function importModel(){
    if(file_opener)file_opener.click();
}
function downloadModel(){
    let options = {
        shouldExportNode: function (node) {
            return node.name === "editUV";
        },
        };

    BABYLON.GLTF2Export.GLBAsync(global.scene, "model", options).then((glb) => {
        glb.downloadFiles();
    });
}
function togglePickColor(ev){
    states.enablePickColor = !states.enablePickColor;
    ev.target.style.color = states.enablePickColor ? "red" : "white";
}
useEffect(()=>{
    const onSelectFile = async () => {
        if(global.loadedMesh){
            scene.getMeshesById("editUV").forEach(mesh =>{
                mesh.dispose();
            });
        }
            
            const url = URL.createObjectURL(file_opener.files[0]);
            const ext = file_opener.files[0].name.split('.').pop();

            const result = await BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene, null, `.${ext}`);
            result.meshes.forEach(mesh=>{
                mesh.name = "editUV";
                mesh.material = global.currentMat;
                mesh.renderingGroupId = 2;
                mesh.normalizeToUnitCube();
            })
            global.loadedMesh = result.meshes[0];
            document.dispatchEvent(new CustomEvent("clearCurrentCanvas"))
            
    };

    file_opener = file_dom.current;
    file_opener.setAttribute("accept", ".obj, .glb");

    file_opener.addEventListener('change', onSelectFile, false);

    console.log("tooltp", document.querySelector(".tooltiptext"))
    
    // const toolTips = document.getElementsByClassName("tooltiptext");

   

    for(let i = 0; i<2; i++){
        const tooltip = document.getElementById(`tooltip${i}`);
        const parent = tooltip.parentNode;
        const bounds = parent.getBoundingClientRect();

        var toolTipHandle = document.createElement("style");
        toolTipHandle.innerHTML = `
        #tooltip${i} {
            visibility: hidden;
            width: 100%;
            background-image: linear-gradient(black, rgba(255, 255, 255, 0.9));
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 5px 0;
            position: absolute;
            z-index: 1;
            top: 120%;
            left: 0%;
            height: 500%;
            box-shadow: 2px 2px 5px black;
            border-color: black;
            /* margin-left: -60px; */
        }
        #tooltip${i}::after {
            content: "";
            position: absolute;
            bottom: 100%;
            left: ${i == 1 ? bounds.x / 3 - 15 : bounds.x / 3 - 3}%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent transparent black transparent;
          }
        
        `
        

        document.head.appendChild(toolTipHandle);
        let hide = false;
        parent.onclick = function(){
            hide = !hide;
            tooltip.style.visibility = !hide? "hidden" : "visible" 
        }

        
        // // tooltip.style.left = (bounds.x - 30) + "px";
        // toolTipHandle.innerHTML = toolTipHandle.innerHTML.replace(/left: [0-9]+%/, `left: ${bounds.x}%`);
    }
}, [])
function toggleFillColor(ev){
    states.enableFillColor = !states.enableFillColor;
    ev.target.style.color = !states.enableFillColor ? "white" : "red";
    if(!states.enableFillColor){
        document.dispatchEvent(new CustomEvent("applyFillColor"));
    }
}
function selectBrush(ev, val){
    if(!states.currentBrush){
        return;
    }
    document.dispatchEvent(new CustomEvent("applyBrush", {detail: val}));
}
 return (
    <div className="navbar rounded-b top-bar shadow-lg border-b border-black" style={{
        width: "95%"
    }}>
        <div className='flex-1 gap-5 top-bar-tools p-5'>
        <input type="file" style={{display: "none"}} id="fileOpener" ref={file_dom}></input>
        {/* <button className='circular'><i className='pencil icon' id="pencilTool"></i></button> */}
        <button className='circular'><i className='paint brush icon'></i><div id="tooltip0" className='flex flex-col'>
            Brushes
            <div className='flex flex-row'>
            <button className='ui circular' onClick={ev => selectBrush(ev, "default")} value="ok"><img src="assets/images/brushes/thumbnails/brush1.png" className='w-16 h-16'></img></button>
            <button className='ui circular' onClick={ev => selectBrush(ev, "textured")}><img src="assets/images/brushes/thumbnails/brush2.png" className='w-16 h-16'></img></button>
            </div>
        </div></button>

        <div onClick={enableEraser} style={{}}><i className='eraser icon'></i></div>
        <button className='circular' onClick={togglePickColor}><i className="eye dropper icon" id="color_eyedropper"></i></button>
        <button className='circular' onClick={toggleFillColor}><i className="bi bi-paint-bucket"></i></button>
        <button className='circular' onClick={importModel}><i className="bi bi-file-earmark-arrow-down-fill"></i></button>
        <button className='circular' onClick={downloadModel}><i className="bi bi-share-fill"></i></button>
        <button className='circular' onClick={downloadModel}><i class="bi bi-lightbulb"></i></button>
        </div>
        <button className='circular w-16 h-16 object-right p-5'><i className='bi bi-grid-3x3-gap'></i><div id="tooltip1">Menu</div></button>
        {/* <button className='circular ui button w-16 h-16 object-right p-5'><i className='bi bi-grid-3x3-gap'></i></button> */}
    </div>
 )
}