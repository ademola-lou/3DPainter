import { states } from "../../utils/state";
import { paintMaterial } from "./ShaderPaintTools/paintMaterial";

export async function loadModel(url, clearLayer = false, ext){
    let container = scene.getMeshByName("modelContainer");
    if(scene.getMeshByName("modelContainer")){
        container.dispose();
    }
    if(!ext){
        ext = url.split('.').pop();
    }
    if(clearLayer){
        document.querySelector("#layersTemplate").innerHTML = "";
    }
    let result = await BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene, null, `.${ext}`);
    container = new BABYLON.Mesh("modelContainer");
    global.modelResult = result;

    result.meshes.forEach(mesh=>{
        if(mesh.geometry){
            mesh.originalName = mesh.name;
            mesh.name = "editUV";
            mesh.id = "editUV";
            mesh.material = paintMaterial("assets/images/matcaps/AtmosphericGlowMatcap.png", mesh.originalName);
            mesh.renderingGroupId = 2;
            mesh.parent = container;
            document.dispatchEvent(new CustomEvent("AddObjectLayer", {detail: {name: mesh.originalName}}));
        }
    })

    if(!clearLayer){
    document.addEventListener("toggleSelectedObjectEdge", ()=>{
        global.modelResult.meshes.forEach(mesh=>{
            if(mesh.originalName !== states.currentSelectedObjectId){
                mesh.visibility = 0.5;
            }else{
                mesh.visibility = 1.0;
            }
        })
    });

    document.addEventListener("toggleLightOptions", ()=>{
        global.modelResult.meshes.forEach(mesh=>{
            mesh.visibility = 1;
        })
    });
    }
    container.normalizeToUnitCube();
    container.scaling.scaleInPlace(2);

    let rootmesh = result.meshes[0];
    return rootmesh;
}