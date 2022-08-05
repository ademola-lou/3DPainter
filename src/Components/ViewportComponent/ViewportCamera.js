export function ViewportCam(){
    const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 4, Math.PI / 4, 4, BABYLON.Vector3.Zero(), scene);
    camera.wheelPrecision = 50;
    camera.pinchPrecision = 700;
    camera.panningSensibility = 1000;
    camera.allowUpsideDown = false;
    camera.lowerRadiusLimit = 0.01;
    camera.minZ = 0.030;
    camera.useNaturalPinchZoom = true;
    camera.panningInertia = 0.5;
    return camera;
}