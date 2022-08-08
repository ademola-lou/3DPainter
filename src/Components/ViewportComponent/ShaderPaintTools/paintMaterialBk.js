import { states } from "../../../utils/state";
import { PROMPT_CHANGES } from "../../MenuBarComponent/footMenuBar";
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
        mat2 scale(vec2 _scale){
            return mat2(_scale.x,0.0,
                        0.0,_scale.y);
        }

    	void main(void) {
            // vec2 _st = gl_FragCoord.xy;
            vec2 _st = vUV.xy;
            // _st = scale(vec2(1.0, 1.0)* 50.0) * _st;
            vec2 final = ((_st+brush.xy) * 50.0).xy;//0.5
            final = scale(vec2(1.0, 1.0)) * final;//35
            // vec4 brushTexture = texture2D(brushSampler, final).xyzw;
            // vec3 rtTexture = texture2D(textureSampler, vec2(vUV.x + brush.x, vUV.y + brush.y)).xyz;
           
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
            float brightness = 1.;

            
            // if(brushTexture.a != 0.0){
            //     dist = 0.0;
            // }
            vec4 newmix = brushColor;

            gl_FragColor = vec4(newmix.xyz, dist * 1.0);
    	}`;
// 
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
    
    shaderMaterial2.setTexture("textureSampler", rtDensity);
    
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

    //blend texture with brush
    //"https://cdn.glitch.me/fd1d2870-1b72-40d3-ac1f-4f21f7e4f0ef/fantasywood.jpg?v=1657786090090"
    let rtex = new BABYLON.Texture("assets/images/brushes/nstar.png");
    rtex.hasAlpha = true;
    //"assets/images/normalMaps/cracknormal.png"
    //"assets/images/textures/wood.jpg", scene)
    shaderMaterialPaintDensity.setTexture("brushSampler", rtex);


    let mat = new BABYLON.StandardMaterial("", scene);
    // mat.specularColor = BABYLON.Color3.Black();
    // mat.disableLighting = true;

    const matCapTexture = new BABYLON.Texture(matcapurl, scene);
    matCapTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
    
    // mat.bumpTexture = rtex2;//new BABYLON.Texture("assets/images/normalMaps/fabric.jpg");
    // mat.bumpTexture.level = 0.8;
    mat.diffuseTexture = rtex2;

    startPainting(shaderMaterialPaintDensity, rtDensity);


    document.addEventListener("applyFillColor", ev =>{
        shaderMaterialPaintDensity.setFloat("fill", states.enableFillColor);
    })
    
    document.addEventListener("eraseColor", ev =>{
        alert("haha")
        shaderMaterialPaintDensity.setFloat("erase", states.eraserEnabled);
    })

    document.addEventListener("clearCurrentCanvas", ev=>{
        rtDensity.skipInitialClear = false;
        setTimeout(()=>{
            rtDensity.skipInitialClear = true;
        }, 100)
    })

    document.addEventListener(PROMPT_CHANGES[1], ev=>{
        matCapTexture.updateURL(states.matcapUrl+"");
        mat.reflectionTexture = matCapTexture;

    })
    return mat;
}