import { states } from "../../../utils/state";
import { startPainting } from "./paintFunction";
import { PROMPT_CHANGES } from "../../MenuBarComponent/footMenuBar";
import { applyBrushSettings, BRUSH_SETTINGS } from "../../../utils/brushesSetting";

const createShader = function(name, vs, fs, scene) {
    return new BABYLON.ShaderMaterial(name, scene, {
        vertex: vs,
        fragment: fs,
	    },
        {
			attributes: ["position", "normal", "uv"],
			uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "brush", "brushColor", "fill"]
        });
}


BABYLON.Effect.ShadersStore["customVertexShader"]= `
		precision highp float;
    	attribute vec3 position;
    	attribute vec2 uv;
    	uniform mat4 worldViewProjection;
    	varying vec2 vUV;
    	void main(void) {
    	    gl_Position = vec4(uv * 2. - 1., 0.5, 1.0);
    	    vUV = uv;
    	}`;

    BABYLON.Effect.ShadersStore["addDensityFragmentShader"]=`
	   precision highp float;
        varying vec2 vUV;
    	uniform vec3 brush; // position.xy, radius
        uniform vec4 brushColor; // 
    	uniform sampler2D textureSampler;
        uniform sampler2D brushSampler;
        uniform vec3 clearColor;
        uniform float erase;
        uniform float fill;
        uniform float strength;
        uniform float opacity;
        uniform float brightness;
        uniform float mixTexture;

        float circle(in vec2 _st, in float _radius){
            float dist =  1. - distance(vUV, brush.xy) / brush.z;
            return 1.-smoothstep(_radius-(_radius*0.01),
                                _radius+(_radius*0.01),
                                dist*4.0);
        }

    	void main(void) {
            vec2 _st = gl_FragCoord.xy;
            vec3 brushTexture = texture2D(brushSampler, vec2(vUV.x + brush.x, vUV.y + brush.y)).xyz;
             vec3 rtTexture = texture2D(textureSampler, vec2(vUV.x + brush.x, vUV.y + brush.y)).xyz;
           
            float radius = brush.z;
            vec3 adjColor = brushColor.xyz;
            if(fill == 1.0){
                radius = 1000.0;
            }else{
                radius = brush.z;
            }
            if(erase == 1.0){
                adjColor = clearColor.xyz;
            }else{
                adjColor = brushColor.xyz;
            }

            if(mixTexture == 1.0){
                if(erase == 1.0){
                    adjColor = clearColor.xyz;
                }else{
                    adjColor *= brushTexture.rgb;
                }
            }

            float dist = 1. - distance(vUV, brush.xy) / radius;

            gl_FragColor = vec4((adjColor.xyz)+ brightness, (dist * strength));
    	}`;

    BABYLON.Effect.ShadersStore["drawRTFragmentShader"]=`
	   precision highp float;

    	varying vec2 vUV;

    	uniform sampler2D textureSampler;
        uniform sampler2D combineSampler;
        uniform float fill;
        uniform vec3 fillColor;
        uniform float undo;

    	void main(void) {
            vec4 outcol = texture2D(textureSampler, vUV);
            vec4 combcol = texture2D(combineSampler, vUV);

            // vec3 tint = vec3(1.0, 1.0, 1.0);
            // vec3 color_view = outcol.xyz * tint.xyz;
            
            // gl_FragColor = vec4(color_view.xyz, 1.0);

            vec4 adjcomb = combcol;

            gl_FragColor = vec4(mix(outcol.rgb, adjcomb.rgb, adjcomb.a), 1.0);

    	}`;



export function paintMaterial(matcapurl, objectName){
    const camera = scene.activeCamera;

    const shaderMaterial2 = createShader("shader2", "custom", "drawRT", scene);
    const shaderMaterialPaintDensity = createShader("shaderDensity", "custom", "addDensity", scene);
    shaderMaterialPaintDensity.setFloat("erase", false);
    shaderMaterialPaintDensity.setFloat("fill", false);
    shaderMaterialPaintDensity.setColor3("clearColor", global.scene.clearColor);

    const resolution = 1024;
    let rtDensity = new BABYLON.RenderTargetTexture(objectName+'Density', resolution, scene, BABYLON.TextureFormat.RG16Float);
    rtDensity.clearColor = global.scene.clearColor;
    
    scene.customRenderTargets.push(rtDensity);
    
    shaderMaterial2.setTexture("textureSampler", rtDensity);
    camera.layerMask = 1;

    // in RTT
    var planDensity = BABYLON.MeshBuilder.CreatePlane("plan", {size:1}, scene);
   
    shaderMaterialPaintDensity.alpha = 0.9999;
    shaderMaterialPaintDensity.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
	planDensity.material = shaderMaterialPaintDensity;
    planDensity.layerMask = 2

    // var sphere = BABYLON.MeshBuilder.CreateBox("sphere", {size: 1, sideOrientation: 0}, scene);
   
    // sphere.material = new BABYLON.StandardMaterial("mat", scene);
    // sphere.material.specularColor = BABYLON.Color3.Black();
    // sphere.material.disableLighting = true;
    // sphere.material.emissiveColor = BABYLON.Color3.White();
    // sphere.material.diffuseTexture = new BABYLON.Texture("assets/images/pepsi.png");
    // sphere.material.diffuseTexture.hasAlpha = true;
    // sphere.layerMask = 2;
    // sphere.parent = camera
    // sphere.position.z += 5
    // planDensity.parent = camera
    // planDensity.position.z += 5
    // planDensity.renderingGroupId = 2

    rtDensity.renderList.push(planDensity)//, sphere);
    rtDensity.setMaterialForRendering(planDensity, shaderMaterialPaintDensity);

    let rtex2 =new BABYLON.RenderTargetTexture(objectName+'Foundation', resolution, scene, BABYLON.TextureFormat.RGA16Float);
    rtex2._base = true;
    scene.customRenderTargets.push(rtex2);
    let background = BABYLON.MeshBuilder.CreatePlane("plan", {size:1}, scene);
    background.material = shaderMaterial2;
    background.layerMask = 2
    rtex2.renderList.push(background);

    let mat = new BABYLON.PBRMaterial("", scene);
    mat.metallic = 0.4;
    mat.roughness = 0.8;
    // mat.specularColor = BABYLON.Color3.Black();
    // mat.disableLighting = true;

    var matCapTexture = new BABYLON.Texture(matcapurl, scene);
    matCapTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
    
    mat.albedoTexture = rtex2;

    startPainting(shaderMaterialPaintDensity, rtDensity, objectName);

    let functionA = function(){
        if(states.currentSelectedObjectId !== objectName){
            return;
        }
        shaderMaterialPaintDensity.setFloat("fill", states.enableFillColor);
    }
    document.addEventListener("applyFillColor", functionA);
    
    let functionB = function(){
        if(states.currentSelectedObjectId !== objectName){
            return;
        }
        shaderMaterialPaintDensity.setFloat("erase", states.eraserEnabled);
    }
    document.addEventListener("eraseColor", functionB);

    let functionC = function(){
        if(states.currentSelectedObjectId !== objectName){
            return;
        }
        if(states.matcapUrl.includes("assets/images/matcaps/SlateGreyMatcap.png")){
            matCapTexture.updateURL(states.matcapUrl+"");
            mat.reflectionTexture = null;
        }else{
            matCapTexture.updateURL(states.matcapUrl+"");
            mat.reflectionTexture = matCapTexture;
        }
    }
    document.addEventListener(PROMPT_CHANGES[1], functionC);

    let functionD = (ev) =>{
        if(states.currentSelectedObjectId !== objectName){
            return;
        }
        applyBrushSettings(shaderMaterialPaintDensity, BRUSH_SETTINGS[ev.detail]);
        states.currentBrush = BRUSH_SETTINGS[ev.detail];
    }
    document.addEventListener("applyBrush", functionD);

    let functionE = ()=>{
        if(states.currentSelectedObjectId !== objectName){
            return;
        }
        shaderMaterialPaintDensity.setTexture("brushSampler", new BABYLON.Texture(states.currentBrush.textureUrl+"", global.scene));
    }
    document.addEventListener("applyMixTexture", functionE);

    //new layers
    shaderMaterial2.setTexture("combineSampler", new BABYLON.RawTexture(null, 512, 512));

    let functionF = (ev)=>{
        if(states.currentSelectedObjectId !== objectName){
            return;
        }
        let new_layer_rt = new BABYLON.RenderTargetTexture(ev.detail.layerType+"_layer", resolution, scene, BABYLON.TextureFormat.RG16Float);
    
        if(ev.detail.layerType.includes("Base")){
            new_layer_rt.clearColor = new BABYLON.Color4(scene.clearColor.r, scene.clearColor.g, scene.clearColor.b, 0)
            new_layer_rt.hasAlpha = true;
            shaderMaterial2.setTexture("combineSampler", new_layer_rt);
        }
        if(ev.detail.layerType.includes("Normal")){
            mat.bumpTexture = new_layer_rt;
            mat.bumpTexture.level = 3;
        }

        scene.customRenderTargets.push(new_layer_rt);
    
        new_layer_rt.renderList.push(planDensity);

        document.dispatchEvent(new CustomEvent("selectLayer", {detail:{
            layerType: ev.detail.layerType
        }
        }));

        setTimeout(() => {
            new_layer_rt.skipInitialClear = true;
        }, 100);

    }
    document.addEventListener("addLayer", functionF)
    
    let functionG = (ev)=>{
        if(states.currentSelectedObjectId !== objectName){
            return;
        }
        scene.customRenderTargets.forEach(rt =>{
            
            if(!rt._base){
                rt.refreshRate = 0;
            }
        });
        scene.getTextureByName(ev.detail.layerType+"_layer").refreshRate = 1;
    }
    document.addEventListener("selectLayer", functionG);
    
    let functionH = ()=>{
        rtDensity.dispose();
        rtex2.dispose();
        planDensity.dispose();
        shaderMaterial2.dispose();
        shaderMaterialPaintDensity.dispose();
        mat.dispose();
        background.dispose();

        //clear all event listeners in this function
        document.removeEventListener("applyFillColor", functionA);
        document.removeEventListener("eraseColor", functionB);
        document.removeEventListener(PROMPT_CHANGES[1], functionC);
        document.removeEventListener("applyBrush", functionD);
        document.removeEventListener("applyMixTexture", functionE);
        document.removeEventListener("addLayer", functionF);
        document.removeEventListener("selectLayer", functionG);

        document.removeEventListener("clearCurrentCanvas", functionH);
    }
    document.addEventListener("clearCurrentCanvas", functionH);

    return mat;
}

document.addEventListener("SelectObjectLayer", () =>{
    scene.customRenderTargets.forEach(rt =>{
        if(!rt.name.includes(states.currentSelectedObjectId)){
            rt.refreshRate = 0;
        }
    });
    scene.getTextureByName(states.currentSelectedObjectId+"Density").refreshRate = 1;
    scene.getTextureByName(states.currentSelectedObjectId+"Foundation").refreshRate = 1;
    document.dispatchEvent(new CustomEvent("toggleSelectedObjectEdge"));
});