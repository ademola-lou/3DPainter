import React, { useEffect } from 'react';
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
            global.loadedMesh.dispose();
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
 return (
    <div className="navbar rounded-b top-bar shadow-lg border-b border-black" style={{
        width: "95%"
    }}>
        <div className='flex-1 gap-5 top-bar-tools p-5'>
        <input type="file" style={{display: "none"}} id="fileOpener" ref={file_dom}></input>
        {/* <button className='circular'><i className='pencil icon' id="pencilTool"></i></button> */}
        <button className='circular'><i className='paint brush icon'></i><span id="tooltip0">Brushes</span></button>
        <button className='circular' onClick={enableEraser}><i className='eraser icon'></i></button>
        <button className='circular' onClick={togglePickColor}><i className="eye dropper icon" id="color_eyedropper"></i></button>
        <button className='circular' onClick={toggleFillColor}><i className="bi bi-paint-bucket"></i></button>
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-paint-bucket" viewBox="0 0 16 16">
        <path d="M6.192 2.78c-.458-.677-.927-1.248-1.35-1.643a2.972 2.972 0 0 0-.71-.515c-.217-.104-.56-.205-.882-.02-.367.213-.427.63-.43.896-.003.304.064.664.173 1.044.196.687.556 1.528 1.035 2.402L.752 8.22c-.277.277-.269.656-.218.918.055.283.187.593.36.903.348.627.92 1.361 1.626 2.068.707.707 1.441 1.278 2.068 1.626.31.173.62.305.903.36.262.05.64.059.918-.218l5.615-5.615c.118.257.092.512.05.939-.03.292-.068.665-.073 1.176v.123h.003a1 1 0 0 0 1.993 0H14v-.057a1.01 1.01 0 0 0-.004-.117c-.055-1.25-.7-2.738-1.86-3.494a4.322 4.322 0 0 0-.211-.434c-.349-.626-.92-1.36-1.627-2.067-.707-.707-1.441-1.279-2.068-1.627-.31-.172-.62-.304-.903-.36-.262-.05-.64-.058-.918.219l-.217.216zM4.16 1.867c.381.356.844.922 1.311 1.632l-.704.705c-.382-.727-.66-1.402-.813-1.938a3.283 3.283 0 0 1-.131-.673c.091.061.204.15.337.274zm.394 3.965c.54.852 1.107 1.567 1.607 2.033a.5.5 0 1 0 .682-.732c-.453-.422-1.017-1.136-1.564-2.027l1.088-1.088c.054.12.115.243.183.365.349.627.92 1.361 1.627 2.068.706.707 1.44 1.278 2.068 1.626.122.068.244.13.365.183l-4.861 4.862a.571.571 0 0 1-.068-.01c-.137-.027-.342-.104-.608-.252-.524-.292-1.186-.8-1.846-1.46-.66-.66-1.168-1.32-1.46-1.846-.147-.265-.225-.47-.251-.607a.573.573 0 0 1-.01-.068l3.048-3.047zm2.87-1.935a2.44 2.44 0 0 1-.241-.561c.135.033.324.11.562.241.524.292 1.186.8 1.846 1.46.45.45.83.901 1.118 1.31a3.497 3.497 0 0 0-1.066.091 11.27 11.27 0 0 1-.76-.694c-.66-.66-1.167-1.322-1.458-1.847z"/>
        </svg></button> */}
        <button className='circular' onClick={importModel}><i className="bi bi-file-earmark-arrow-down-fill"></i></button>
        <button className='circular' onClick={downloadModel}><i className="bi bi-share-fill"></i></button>
        </div>
        <button className='circular w-16 h-16 object-right p-5'><i className='bi bi-grid-3x3-gap'></i><span id="tooltip1">Menu</span></button>
        {/* <button className='circular ui button w-16 h-16 object-right p-5'><i className='bi bi-grid-3x3-gap'></i></button> */}
    </div>
 )
}