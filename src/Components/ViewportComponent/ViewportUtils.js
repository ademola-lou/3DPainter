import { states } from "../../utils/state";
import { paintMaterial } from "./ShaderPaintTools/paintMaterial";

let attachPaintMaterialEvent;
export async function loadModel(url, clearLayer = false, ext){
    let container = scene.getMeshByName("modelContainer");
    if(scene.getMeshByName("modelContainer")){
        container.dispose();
        scene.onPointerObservable.remove(attachPaintMaterialEvent);
    }
    if(!ext){
        ext = url.split('.').pop();
    }
    if(clearLayer){
        let layersContainer = document.querySelectorAll(".ObjectlayersList");

        layersContainer.forEach(elem =>{
            elem.dividerElem.remove();
            elem.remove();

            elem.dividerElem = null;
            elem = null;
        });
    }

    let result = await BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene, null, `.${ext}`);
    container = new BABYLON.Mesh("modelContainer");
    global.modelResult = result;

    container.canExport = true;

    let targetMesh;
    result.meshes.forEach(mesh=>{
        if(mesh.geometry){
            mesh.originalName = mesh.name;
            mesh.state = "editUV";
            if(mesh.material){
                mesh.material.dispose();
                mesh.material = null;
            }
            mesh.canExport = true;
            mesh.renderingGroupId = 2;
            mesh.parent = container;
            document.dispatchEvent(new CustomEvent("AddObjectLayer", {detail: {name: mesh.originalName}}));
            targetMesh = mesh;
        }
    })

    targetMesh.material = paintMaterial("assets/images/matcaps/AtmosphericGlowMatcap.png", targetMesh.originalName);

    attachPaintMaterialEvent = scene.onPointerObservable.add(()=>{
        let pickResult = scene.pick(scene.pointerX, scene.pointerY, function predicate(mesh) {
            if (!mesh.state.includes("editUV")) {
                return false;
            }
            return true;
        });	
    
    
        if(states.selectionMode){	
            
            if(pickResult.hit){
                const layersList = document.getElementsByClassName("ObjectlayersList");
                for (let i=0; i < layersList.length; i++) {
                    layersList[i].style.color = "white";
                }
                document.getElementById(pickResult.pickedMesh.originalName+"_layer").style.color = "orange";
                states.currentSelectedObjectId = pickResult.pickedMesh.originalName;

                if(pickResult.pickedMesh.material === null){
                    pickResult.pickedMesh.material = paintMaterial("assets/images/matcaps/AtmosphericGlowMatcap.png", pickResult.pickedMesh.originalName);
                    console.log("needs paint mat")
                }
                document.dispatchEvent(new CustomEvent("SelectObjectLayer"));
            }
        }
    }, BABYLON.PointerEventTypes.POINTERUP);


    container.normalizeToUnitCube();
    container.scaling.scaleInPlace(2);
    // let rootmesh = result.meshes[0];
    return container;
}


document.addEventListener("toggleSelectedObjectEdge", ()=>{
    global.modelResult.meshes.forEach(mesh=>{
        if(mesh.originalName !== states.currentSelectedObjectId){
            mesh.visibility = 0.5;
            mesh.state = "hiddeneditUV";
        }else{
            mesh.visibility = 1.0;
            mesh.state = "editUV";
        }
    })
});

document.addEventListener("toggleLightOptions", ()=>{
    global.modelResult.meshes.forEach(mesh=>{
        mesh.visibility = 1;
        mesh.state = "editUV";
    })
});