import { applyBrushSettings, BRUSH_SETTINGS } from "../../../utils/brushesSetting";
import { UNDO_CACHE_LIMIT } from "../../../utils/SaveTexture";
import { states } from "../../../utils/state";
let undoCacheIndex = 0;
export function startPainting(shaderMaterialPaintDensity, rtDensity, objectName){
    //use default brush settings
    states.currentBrush = BRUSH_SETTINGS.default;
    applyBrushSettings(shaderMaterialPaintDensity, states.currentBrush, true);

    let {strength, color} = states.currentBrush;
    let {radius, lockScreen} = states;

    const engine = scene.getEngine();
    // handle draw
    let pointerDown = false;
    let startTime = 0, endTime = 0;
    let isDoubleTapped = false;
    scene.onPointerObservable.add(({ event }) => {
        if(states.currentSelectedObjectId !== objectName){
            return;
        }
        let pickResult = scene.pick(scene.pointerX, scene.pointerY, function predicate(mesh) {
            if (mesh.state !== "editUV") {
                return false;
            }
            return true;
        });	
        if(pickResult.hit && states.lockScreen){
            let currentPlane = scene.getMeshByName(objectName+"LayerPlane");
            let undoRtex = scene.getTextureByName("undoTexture"+undoCacheIndex);
            undoRtex.freshCache = true;
            undoRtex.refreshRate = 1;
            undoRtex.renderList[0] = currentPlane;
            undoRtex.refreshRate = 0;
            
            setTimeout(()=>{
                pointerDown = true;
            }, 10);

            undoCacheIndex = ++undoCacheIndex % UNDO_CACHE_LIMIT;
        }
    }, BABYLON.PointerEventTypes.POINTERDOWN);

    let size = rtDensity.getSize();

    scene.onPointerObservable.add(({ event }) => {
        if(states.currentSelectedObjectId !== objectName){
            return;
        }
        if (pointerDown && states.lockScreen) {
           
            const canvas = engine.getRenderingCanvas();

            let pickResult = scene.pick(scene.pointerX, scene.pointerY, function predicate(mesh) {
                if (mesh.state !== "editUV") {
                    return false;
                }
                return true;
            });		
			var texcoords = pickResult.getTextureCoordinates();
            if(!texcoords || states.enablePickColor){
                return;
            }

			let fact = states.currentBrush.radius * (states.currentBrush.radius / 100);
			var centerX = texcoords.x - (size.width * fact);
			var centerY = texcoords.y - (size.height * fact);

            const x = texcoords.x - (size.width * fact);
            const y = texcoords.y + (size.height * fact);
            shaderMaterialPaintDensity.setVector3("brush", new BABYLON.Vector4(x, y, states.currentBrush.radius));
            shaderMaterialPaintDensity.setFloat("brightness", states.currentBrush.brightness);
            shaderMaterialPaintDensity.setVector4("brushColor", new BABYLON.Vector4(color.r, color.g, color.b, 1.));
        }
    }, BABYLON.PointerEventTypes.POINTERMOVE);
    
    scene.onPointerObservable.add(({ event }) => {
        if(states.currentSelectedObjectId !== objectName){
            return;
        }
        pointerDown = false;
        shaderMaterialPaintDensity.setVector3("brush", new BABYLON.Vector4(0,0,0));
        
        let pickResult = scene.pick(scene.pointerX, scene.pointerY, function predicate(mesh) {
            if (!mesh.state.includes("editUV")) {
                return false;
            }
            return true;
        });	


        // if(states.selectionMode){	

        //     if(pickResult.hit){
        //         const layersList = document.getElementsByClassName("ObjectlayersList");
        //         for (let i=0; i < layersList.length; i++) {
        //             layersList[i].style.color = "white";
        //         }
        //         document.getElementById(pickResult.pickedMesh.originalName+"_layer").style.color = "orange";
        //         states.currentSelectedObjectId = pickResult.pickedMesh.originalName;
        //         document.dispatchEvent(new CustomEvent("SelectObjectLayer"));
        //     }
        // }

        if(states.enablePickColor){	

            var texcoords = pickResult.getTextureCoordinates();
            if(texcoords){
            let texture = rtDensity;
            let uv = texcoords;

            let x = texcoords.x * texture.getSize().width;
            let y = texcoords.y * texture.getSize().height;

            let textureWidth = texture.getSize().width;
            let textureHeight = texture.getSize().height;

            texture.readPixels().then(buffer =>{

            let red = buffer[Math.floor(uv.x * (textureWidth - 1)) * 4 +
            Math.floor(uv.y * (textureHeight - 1)) * textureWidth * 4];
            
            let green = buffer[Math.floor(uv.x * (textureWidth - 1)) * 4 +
                        Math.floor(uv.y * (textureHeight - 1)) * textureWidth * 4 + 1];
            let blue = buffer[Math.floor(uv.x * (textureWidth - 1)) * 4 +
                        Math.floor(uv.y * (textureHeight - 1)) * textureWidth * 4 + 2];
            let alpha = buffer[Math.floor(uv.x * (textureWidth - 1)) * 4 +
                        Math.floor(uv.y * (textureHeight - 1)) * textureWidth * 4 + 3];
            color.set(red/255, green/255, blue/255);
            document.dispatchEvent(new CustomEvent("updatePallete", {detail: color}))
            });

            //reset state
            document.querySelector("#color_eyedropper").style.color = "white";
            states.enablePickColor = false;
          }
        }
        if(states.enableFillColor){
            console.log("apply fill color")
            document.dispatchEvent(new CustomEvent("applyFillColor"));
        }

    }, BABYLON.PointerEventTypes.POINTERUP);
    
    // scene.onPointerObservable.add(()=>{
        // if(states.currentSelectedObjectId !== objectName){
        //     return;
        // }
        // let undoRtex = scene.getTextureByName("undoTexture");
        // shaderMaterialPaintDensity.setFloat("undo", true);
        // shaderMaterialPaintDensity.setTexture("brushSampler", undoRtex);
        
        // setTimeout(()=>{
        //     shaderMaterialPaintDensity.setFloat("undo", false);
            
        // }, 100)
        
    // }, BABYLON.PointerEventTypes.POINTERDOUBLETAP);

    document.addEventListener("undoChanges", ()=>{
        if(states.currentSelectedObjectId !== objectName){
            return;
        }
        if(undoCacheIndex == 0){
            undoCacheIndex = UNDO_CACHE_LIMIT;
        }
        undoCacheIndex = --undoCacheIndex % UNDO_CACHE_LIMIT;

        let undoRtex = scene.getTextureByName("undoTexture"+undoCacheIndex);
        
        if(undoRtex.freshCache === false){
            return;
        }
        shaderMaterialPaintDensity.setFloat("undo", true);
        shaderMaterialPaintDensity.setTexture("undoSampler", undoRtex);
        
        setTimeout(()=>{
            shaderMaterialPaintDensity.setFloat("undo", false);
        }, 100);

        undoRtex.freshCache = false;
    });

    setTimeout(()=>{
        rtDensity.skipInitialClear = true;
    }, 100);
}