import { states } from "./state";

const DEFAULT_TEXTURE_URL = "assets/images/brushes/textured_brush.jpg"//"assets/images/brushes/organic.jpg"
export const BRUSH_SETTINGS = {
    "default": {
        "radius": 0.04,
        "strength": 1.0,
        "color": BABYLON.Color3.White(),
        "brightness": 0.0,
        "opacity": 0.05,
        "mixTexture": false
    },
    "textured": {
        "radius": 0.04,
        "strength": 1.0,
        "color": BABYLON.Color3.White(),
        "brightness": 0.0,
        "opacity": 0.05,
        "mixTexture": true,
        "textureUrl": "assets/images/brushes/textured_brush.jpg"
    }
}

export function applyBrushSettings(brushShader, settings, reset = false){
    if(reset){
        brushShader.setFloat("radius", settings.radius);
        brushShader.setFloat("strength", settings.strength);
        brushShader.setColor3("color", settings.color);
        brushShader.setFloat("opacity", settings.opacity);
        brushShader.setFloat("brightness", settings.brightness);
    }else{
        console.log("ok oo", states.currentBrush, settings)
        settings.radius = states.currentBrush.radius;
        settings.strength = states.currentBrush.strength;
        settings.opacity = states.currentBrush.opacity;
        settings.brightness = states.currentBrush.brightness;
        settings.color = states.currentBrush.color;
    }
    brushShader.setFloat("mixTexture", settings.mixTexture);
    let mix_texture = new BABYLON.Texture(DEFAULT_TEXTURE_URL+"", global.scene);
    console.log("size", mix_texture)
    brushShader.setTexture("brushSampler", mix_texture);
    if(settings.mixTexture){
        brushShader.setTexture("brushSampler", new BABYLON.Texture(settings.textureUrl+"", global.scene));
    }

}