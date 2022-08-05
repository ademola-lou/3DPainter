import { states } from "../../../utils/state";

export function startPainting(shaderMaterialPaintDensity, rtDensity){
    let {radius, strength, color, lockScreen} = states;
    const engine = scene.getEngine();
    // handle draw
    let pointerDown = false;
    scene.onPointerObservable.add(({ event }) => {
        pointerDown = true;
    }, BABYLON.PointerEventTypes.POINTERDOWN);

    let size = rtDensity.getSize();

    scene.onPointerObservable.add(({ event }) => {
     
        if (pointerDown && states.lockScreen) {
           
            const canvas = engine.getRenderingCanvas();

            let pickResult = scene.pick(scene.pointerX, scene.pointerY, function predicate(mesh) {
                if (mesh.name !== "editUV") {
                    return false;
                }
                return true;
            });		
			var texcoords = pickResult.getTextureCoordinates();
            if(!texcoords || states.enablePickColor){
                return;
            }

			let fact = states.radius * (states.radius / 100);
			var centerX = texcoords.x - (size.width * fact);
			var centerY = texcoords.y - (size.height * fact);

            const x = texcoords.x - (size.width * fact);
            const y = texcoords.y + (size.height * fact);
            shaderMaterialPaintDensity.setVector4("brush", new BABYLON.Vector4(x, y, states.radius, strength));
            shaderMaterialPaintDensity.setVector4("brushColor", new BABYLON.Vector4(color.r, color.g, color.b, 1.));
        }
    }, BABYLON.PointerEventTypes.POINTERMOVE);
    
    scene.onPointerObservable.add(({ event }) => {

        pointerDown = false;
        shaderMaterialPaintDensity.setVector4("brush", new BABYLON.Vector4(0,0,0,0));

        if(states.enablePickColor){

            let pickResult = scene.pick(scene.pointerX, scene.pointerY, function predicate(mesh) {
                if (mesh.name !== "editUV") {
                    return false;
                }
                return true;
            });		
            var texcoords = pickResult.getTextureCoordinates();
            if(!texcoords){
                return;
            }

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
            document.querySelector("#color_eyedropper").style.color = "black";
            states.enablePickColor = false;
        }
        if(states.enableFillColor){
            console.log("apply fill color")
            document.dispatchEvent(new CustomEvent("applyFillColor"));
        }
    }, BABYLON.PointerEventTypes.POINTERUP);
    
    // rtDensity.onClearObservable.add(()=>{});
    setTimeout(()=>{
        rtDensity.skipInitialClear = true;
    }, 100);
}