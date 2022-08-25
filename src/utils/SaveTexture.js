export const UNDO_CACHE_LIMIT = 3;
export function undoTexture(resolution, index){
    let undoTexture = new BABYLON.RenderTargetTexture("undoTexture"+index, resolution, scene, BABYLON.TextureFormat.RG16Float);
    undoTexture.clearColor = global.scene.clearColor;

    scene.customRenderTargets.push(undoTexture);
    undoTexture.refreshRate = 0;

    setTimeout(()=>{
        undoTexture.skipInitialClear = true;
    }, 100);
    return undoTexture;
}