import { states } from "../../../utils/state";
import { startPainting } from "./paintFunction";

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
    	uniform vec4 brush; // position.xy, radius, strength
        uniform vec4 brushColor; // 
    	uniform sampler2D textureSampler;
        uniform sampler2D brushSampler;
        uniform vec3 clearColor;
        uniform float erase;
        uniform float fill;

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
            float dist = 1. - distance(vUV, brush.xy) / radius;
            float brightness = 1.0;

            gl_FragColor = vec4((adjColor.xyz)* brightness, dist * 1.0);
    	}`;

    BABYLON.Effect.ShadersStore["drawRTFragmentShader"]=`
	   precision highp float;

    	varying vec2 vUV;

    	uniform sampler2D textureSampler;
        uniform float fill;
        uniform vec3 fillColor;
        uniform float undo;
    	void main(void) {
            vec4 outcol = texture2D(textureSampler, vUV);

            vec3 tint = vec3(1.0, 1.0, 1.0);
            vec3 color_view = outcol.xyz * tint.xyz;
            
            gl_FragColor = vec4(color_view.xyz, 1.0);

    	}`;



export function paintMaterial(matcapurl){
    const camera = scene.activeCamera;

    const shaderMaterial2 = createShader("shader2", "custom", "drawRT", scene);
    const shaderMaterialPaintDensity = createShader("shaderDensity", "custom", "addDensity", scene);
    shaderMaterialPaintDensity.setFloat("erase", false);
    shaderMaterialPaintDensity.setFloat("fill", false);
    shaderMaterialPaintDensity.setColor3("clearColor", global.scene.clearColor);

    const resolution = 1024;
    let rtDensity = new BABYLON.RenderTargetTexture('Density', resolution, scene, BABYLON.TextureFormat.RG16Float);
    rtDensity.clearColor = global.scene.clearColor;
    scene.customRenderTargets.push(rtDensity);
    //"https://cdn.glitch.me/fd1d2870-1b72-40d3-ac1f-4f21f7e4f0ef/fantasywood.jpg?v=1657786090090"
    let rtex = new BABYLON.Texture("assets/images/brushes/organic.jpg", scene)
    shaderMaterial2.setTexture("textureSampler", rtDensity);
    shaderMaterialPaintDensity.setTexture("brushSampler", rtex)
    camera.layerMask = 1;

    // in RTT
    var planDensity = BABYLON.MeshBuilder.CreatePlane("plan", {size:1}, scene);
   
    shaderMaterialPaintDensity.alpha = 0.9999;
    // shaderMaterialPaintDensity.alphaMode = BABYLON.Engine.ALPHA_ADD;
    shaderMaterialPaintDensity.setVector4("brush", new BABYLON.Vector4(0,0,0,0));
	planDensity.material = shaderMaterialPaintDensity;
    planDensity.layerMask = 2

    rtDensity.renderList.push(planDensity);
    rtDensity.setMaterialForRendering(planDensity, shaderMaterialPaintDensity);

    let rtex2 =new BABYLON.RenderTargetTexture('Density', resolution, scene, BABYLON.TextureFormat.RG16Float);
    
    scene.customRenderTargets.push(rtex2);
    let background = BABYLON.MeshBuilder.CreatePlane("plan", {size:1}, scene);
    background.material = shaderMaterial2;
    background.layerMask = 2
    rtex2.renderList.push(background);

    let mat = new BABYLON.StandardMaterial("", scene);
    // mat.specularColor = BABYLON.Color3.Black();
    // mat.disableLighting = true;

    // var matCapTexture = new BABYLON.Texture(matcapurl, scene);
    // matCapTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
    // mat.reflectionTexture = matCapTexture;
    mat.bumpTexture = new BABYLON.Texture("assets/images/normalMaps/fabric.jpg");
    mat.bumpTexture.level = 0.1;
    mat.diffuseTexture = rtex2;

    startPainting(shaderMaterialPaintDensity, rtDensity);


    document.addEventListener("applyFillColor", ev =>{
        shaderMaterialPaintDensity.setFloat("fill", states.enableFillColor);
    })
    
    document.addEventListener("eraseColor", ev =>{
        shaderMaterialPaintDensity.setFloat("erase", states.eraserEnabled);
    })

    document.addEventListener("clearCurrentCanvas", ev=>{
        rtDensity.skipInitialClear = false;
        setTimeout(()=>{
            rtDensity.skipInitialClear = true;
        }, 100)
    })
    return mat;
}