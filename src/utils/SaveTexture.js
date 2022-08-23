export function undoTexture(resolution){
    let undoTexture = new BABYLON.RenderTargetTexture("undoTexture", resolution, scene, BABYLON.TextureFormat.RG16Float);
    undoTexture.clearColor = global.scene.clearColor;

    scene.customRenderTargets.push(undoTexture);
    undoTexture.refreshRate = 0;

    setTimeout(()=>{
        undoTexture.skipInitialClear = true;
    }, 100);
    return undoTexture;
}