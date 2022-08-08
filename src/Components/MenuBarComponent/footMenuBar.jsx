import React, { useEffect } from 'react';
import { states } from '../../utils/state';

export const PROMPT_CHANGES = {
  0: "None",
  1: "Apply matcap"
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
    let promptBox = document.getElementById("promptDialog");
    
    if(ev.target.innerText === "No"){
        promptBox.style.visibility = "hidden";
        return;
    }
    switch(prompt_c){
        case PROMPT_CHANGES[1]:
            document.dispatchEvent(new CustomEvent(PROMPT_CHANGES[1]))
            break;
    }
    promptBox.style.visibility = "hidden";
  }


  function applyMatCap(ev){
    const bounds = ev.target.getBoundingClientRect();

    let promptBox = document.getElementById("promptDialog");
    promptBox.style.visibility = promptBox.style.visibility === "visible"? "hidden" : "visible";

    states.matcapUrl = ev.target.src;
    prompt_c = PROMPT_CHANGES[1];
  }
  function openImageFolder(){
    image_opener.click();
  }
  function openBrushSettings(){
      document.querySelector(".matcapthumbnails").classList.replace("visible", "hidden");
      document.querySelector(".brushSettings").classList.replace("hidden", "visible");
  }
  function openMatcaps(){
    document.querySelector(".brushSettings").classList.replace("visible", "hidden");
    document.querySelector(".matcapthumbnails").classList.replace("hidden", "visible");
  }
    return (
            <div className="rounded foot-bar shadow-lg border-b border-black" style={{
                width: "95%",
            }}>
                <input type="file" style={{display: "none"}} id="imageOpener"></input>
                <i className="bi bi-chevron-up" onClick={toggleFootBarMenu}></i>
                <div id="promptDialog" className='flex flex-col gap-3'>
                apply matcap?
                <button className='circular ui button' onClick={applyPromptChange}>Yes</button>
                <button className='circular ui button' onClick={applyPromptChange}>No</button>
                </div>
                {/* </div> */}
                {/* <div class="hstack gap-3"> */}
                <div className='flex flex-row gap-5' style={{
                    height: "100%"
                }}>
                    <div className="flex flex-col gap-5" style={{textAlign: "left"}}>
                        <button className='ui circular' onClick={openMatcaps}><img src="assets/images/matcaps/SlateGreyMatcap.png" className='w-16 h-16'></img></button>
                        <button className='ui circular ghost-button'><i className="bi bi-layers"></i></button>
                        <button className='ui circular' onClick={openBrushSettings}><i className="bi bi-gear"></i></button>
                        <button className='ui circular'><i className="bi bi-diagram-2"></i></button>
                    </div>
                    <div className="rounded border-l border-white" style={{
                        width: "100%",
                        height: "100%",
                        background: "#2e5090"
                    }}>
                        {/* <input type="range" min="1" max="100" defaultValue={50} className="slider" id="myRange"></input> */}
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
                            <input type="range" min="0" max="100" defaultValue={40} class="range" id="brushStrength"/>
                            </div>

                            <div>
                                Brush Brightness
                            <input type="range" min="0" max="100" defaultValue={40} class="range" id="brushStrength"/>
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