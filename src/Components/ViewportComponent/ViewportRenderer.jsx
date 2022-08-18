import React, { useEffect } from 'react';
import { startUI } from './GUI/loadUI';
import { paintMaterial } from './ShaderPaintTools/paintMaterial';
import { ViewportCam } from './ViewportCamera';
import { loadModel } from './ViewportUtils';

async function renderScene(canvas){
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false});
    const scene = new BABYLON.Scene(engine);
    window.scene = scene;
    scene.clearColor = new BABYLON.Color3.Gray()//.FromHexString("#202122");//(0.6,0.6,0.6);
    
    function renderLoop(){
     scene.render();
    }
     // Resize
     window.addEventListener("resize", function () {
        engine.resize();
    });
    engine.runRenderLoop(renderLoop);
    
    const camera = new ViewportCam();
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1;
    // var matCap = new BABYLON.StandardMaterial("", scene);
    // var matCapTexture = new BABYLON.Texture("assets/images/matcaps/metal.jpg", scene);
    // matCapTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
    // matCap.reflectionTexture = matCapTexture;
    // matCap.diffuseTexture = rtex2;
    const matCap = paintMaterial("assets/images/matcaps/AtmosphericGlowMatcap.png");
    // matcap-porcelain-white.jpg
    const url = "assets/models/vans.obj";
    console.log(url, url.split('.').pop())
    // "https://cdn.glitch.me/2d9651bd-507d-44d5-b9f0-c7c3795f5b73/human.obj?v=1657822205641"
    const loadedMesh = await loadModel(url);
    camera.setTarget(loadedMesh.position);

    global.loadedMesh = loadedMesh;
    // global.currentMat = matCap;
    //GUI
    startUI();

    var helper = scene.createDefaultEnvironment({
        enableGroundMirror: true,
        groundShadowLevel: 0.6,
    });       

    helper.setMainColor(new BABYLON.Color3.FromHexString("#2e5090"));


}
export function ViewportRenderer(){
    let renderCanvas = React.createRef();
    useEffect(() => {
        renderScene(renderCanvas.current);
    }, [])
    return (
        <canvas id="renderCanvas" ref={renderCanvas}></canvas>
    )
}