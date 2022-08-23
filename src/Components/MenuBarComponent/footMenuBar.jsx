import React, { useEffect } from 'react';
import { states } from '../../utils/state';

export const PROMPT_CHANGES = {
  0: "None",
  1: "apply matcap",
  2: "Add layer"
}

export function FootMenuBar(){

let footbarmenu, prompt_c;
let image_opener;

const onSelectFile = () => {
    const url = URL.createObjectURL(image_opener.files[0]);
    document.getElementById("textureThumbnail").src = url;
    states.currentBrush.textureUrl = url;
    document.dispatchEvent(new CustomEvent("applyMixTexture"))
    image_opener.value = "";

}
  useEffect(()=>{
    footbarmenu = document.querySelector(".foot-bar");
    image_opener = document.querySelector("#imageOpener");

    image_opener.setAttribute("accept", ".png, .jpg");
    image_opener.addEventListener('change', onSelectFile, false);

    document.addEventListener("AddObjectLayer", ev =>{
        let object_new_layer = document.createElement("span");
        object_new_layer.setAttribute("id", ev.detail.name+"_layer")
        object_new_layer.innerText = ev.detail.name+"";
        object_new_layer.style.fontWeight = "bold";
        object_new_layer.className = "ObjectlayersList";

        document.querySelector("#layersTemplate").appendChild(object_new_layer);

        let divider = document.createElement("div");
        divider.className = "ui fitted divider";
        object_new_layer.dividerElem = divider;
        document.querySelector("#layersTemplate").appendChild(divider);

        function selectActiveLayerButton(){
            const layersList = document.getElementsByClassName("ObjectlayersList");
            for (let i=0; i < layersList.length; i++) {
                layersList[i].style.color = "white";
            }
            object_new_layer.style.color = "orange";
            states.currentSelectedObjectId = ev.detail.name;
            document.dispatchEvent(new CustomEvent("SelectObjectLayer"))
        };
        selectActiveLayerButton();
    
        object_new_layer.onclick = ()=>{
            selectActiveLayerButton();
        };
    });
  }, []);

  let showFootBarMenu = false;
  function toggleFootBarMenu(ev){
    showFootBarMenu = !showFootBarMenu;
    if(showFootBarMenu){
        footbarmenu.style.bottom = "-15%";
        ev.target.className = "bi bi-chevron-down";
    }else{
        footbarmenu.style.bottom = "-45%";
        ev.target.className = "bi bi-chevron-up";
    }
    
  }
  
  function applyPromptChange(ev){
    const buttonInfo = ev.target.innerText;
    if(buttonInfo === "No" || buttonInfo === "Close"){
        ev.target.parentNode.style.visibility = "hidden";
        return;
    }
    switch(prompt_c){
        case PROMPT_CHANGES[1]:
            document.dispatchEvent(new CustomEvent(PROMPT_CHANGES[1]))
            break;
        case PROMPT_CHANGES[2]:
            addNewLayer(buttonInfo);
            break;
    }
    ev.target.parentNode.style.visibility = "hidden";
  }


  function applyMatCap(ev){

    document.getElementById("layerDialog").style.visibility = "hidden";
    document.getElementById("matcapDialog").style.visibility = "visible";

    states.matcapUrl = ev.target.src;
    prompt_c = PROMPT_CHANGES[1];

    document.getElementById("matcapDialog").children[0].innerText = prompt_c+"?";
  }
  
  function openLayerPrompt(ev){
    document.getElementById("matcapDialog").style.visibility = "hidden";
    document.getElementById("layerDialog").style.visibility = "visible";

    prompt_c = PROMPT_CHANGES[2];
    document.getElementById("layerDialog").children[0].innerText = prompt_c+"?";
    
  }

  function openImageFolder(){
    image_opener.click();
  }
  function openBrushSettings(){
      document.querySelector(".layers").classList.replace("visible", "hidden");
      document.querySelector(".matcapthumbnails").classList.replace("visible", "hidden");
      document.querySelector(".brushSettings").classList.replace("hidden", "visible");
  }
  function openMatcaps(){
    document.querySelector(".layers").classList.replace("visible", "hidden");
    document.querySelector(".brushSettings").classList.replace("visible", "hidden");
    document.querySelector(".matcapthumbnails").classList.replace("hidden", "visible");
  }
  function openLayers(){
    document.querySelector(".brushSettings").classList.replace("visible", "hidden");
    document.querySelector(".matcapthumbnails").classList.replace("visible", "hidden");
    document.querySelector(".layers").classList.replace("hidden", "visible");
  }

  function addNewLayer(name){
    let new_layer = document.createElement("div");
    new_layer.className = "layersList";
    let sideOptions = document.querySelector("#layerOptions").cloneNode(true);
    new_layer.textContent = "-"+name+" Layer";
    new_layer.style.fontWeight = "normal";
    new_layer.style.fontFamily = "Nexa, sans-serif";
    new_layer.appendChild(sideOptions);
    
    let divider = document.createElement("div")
    divider.className = "ui fitted divider";
    new_layer.appendChild(divider);

    document.getElementById(states.currentSelectedObjectId+"_layer").appendChild(new_layer);
    
    function selectActiveLayerButton(){
        const layersList = document.getElementsByClassName("layersList");
        for (let i=0; i < layersList.length; i++) {
            layersList[i].style.color = "white";
        }
        new_layer.style.color = "blue";
    }
    selectActiveLayerButton();

    new_layer.onclick = ()=>{
        selectActiveLayerButton();

        document.dispatchEvent(new CustomEvent("selectLayer", {detail:{
            layerType: states.currentSelectedObjectId+name
        }
        }));
    }
    
    document.dispatchEvent(new CustomEvent("addLayer", {detail: {
        layerType: states.currentSelectedObjectId+name
        }
      })
    )
  }
    return (
            <div className="rounded foot-bar shadow-lg border-b border-black" style={{
                width: "95%",
            }}>
                <input type="file" style={{display: "none"}} id="imageOpener"></input>
                <i className="bi bi-chevron-up" onClick={toggleFootBarMenu}></i>

                <div id="matcapDialog" className='promptDialog flex flex-col gap-3'>
                <span id="promptMessage" className='rounded-b border-b'></span>
                <button onClick={applyPromptChange}>Yes</button>
                <button onClick={applyPromptChange}>No</button>
                </div>

                <div id="layerDialog" className='promptDialog flex flex-col gap-3'>
                <span id="promptMessage" className='rounded-b border-b'></span>
                <button onClick={applyPromptChange}>Base</button>
                <button onClick={applyPromptChange}>Normal</button>
                <button onClick={applyPromptChange}>Ambient</button>
                <button onClick={applyPromptChange}>Close</button>

                </div>
                <div className='flex flex-row gap-5' style={{
                    height: "100%"
                }}>
                    <div className="flex flex-col gap-5" style={{textAlign: "left"}}>
                        <button className='ui circular' onClick={openMatcaps}><img src="assets/images/matcaps/SlateGreyMatcap.png" className='w-16 h-16'></img></button>
                        <button className='icon-button ui circular ghost-button' onClick={openLayers}><i className="bi bi-layers"></i></button>
                        <button className='icon-button ui circular' onClick={openBrushSettings}><i className="bi bi-gear"></i></button>
                        <button className='icon-button ui circular'><i className="bi bi-diagram-2"></i></button>
                    </div>
                    <div className="rounded border-l border-white" style={{
                        width: "100%",
                        height: "100%",
                        background: "#2e5090"
                    }}>
                        <div className='layers hidden'>
                       
                        <div className='overflow-y-scroll rounded flex flex-col shadow' style={{textAlign: "left", background: "teal", height: "10em"}} id="layersTemplate">
                            <span id="layerNode" className='hidden'>Layer1
                                <div style={{float: "right"}} id="layerOptions">
                                <i className="bi bi-eye-fill"></i>
                                </div>
                            </span>
                         </div>

                         <div className='layerTools m-5' style={{float: "right"}}>
                             <span className='btn btn-circle' onClick={openLayerPrompt}><i className="bi bi-plus"></i></span>
                             <span className='btn btn-circle' onClick={null}><i className="bi bi-trash"></i></span>
                        </div>

                        </div>
                        <div className='matcapthumbnails visible' style={{textAlign: "left"}}>
                            <button className='ui circular' onClick={applyMatCap}><img src="assets/images/matcaps/metal.jpg" className='w-16 h-16'></img></button>
                            <button className='ui circular' onClick={applyMatCap}><img src="assets/images/matcaps/normalmatcap.jpg" className='w-16 h-16'></img></button>
                            <button className='ui circular' onClick={applyMatCap}><img src="assets/images/matcaps/AtmosphericGlowMatcap.png" className='w-16 h-16'></img></button>
                            <button className='ui circular' onClick={applyMatCap}><img src="assets/images/matcaps/SlateGreyMatcap.png" className='w-16 h-16'></img></button>
                            <button className='ui circular' onClick={applyMatCap}><img src="assets/images/matcaps/skin.jpg" className='w-16 h-16'></img></button>
                            <button className='ui circular' onClick={applyMatCap}><img src="assets/images/matcaps/anime_matcap.png" className='w-16 h-16'></img></button>
                            <button className='ui circular' onClick={applyMatCap}><img src="assets/images/matcaps/genshin_matcap.jpg" className='w-16 h-16'></img></button>
                        </div>

                        <div className='brushSettings flex flex-col gap-2 hidden'>
                            <div>
                                Brush Strength
                            <input type="range" min="0" max="100" defaultValue={40} className="range" id="brushStrength"/>
                            </div>

                            <div>
                                Brush Brightness
                            <input type="range" min="0" max="100" defaultValue={40} className="range" id="brushStrength"/>
                            </div>

                            <div>
                                Use Texture
                                <input type="checkbox" className="checkbox" style={{float: "right"}}/>
                            </div>
                            <div style={{display: "flex", justifyContent: "center"}}>
                                <img src="assets/images/matcaps/metal.jpg" id="textureThumbnail" className='w-16 h-16'></img>
                            </div>
                            <button className='btn' onClick={openImageFolder}>
                                Add image
                            </button>
                            
                            
                        </div>

                    </div>
                    </div>
                    {/* <div>test</div>
                </div> */}
            </div>
    )
}