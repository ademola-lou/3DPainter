import { states } from "./state";

const DEFAULT_TEXTURE_URL = "assets/images/brushes/uv_grid_opengl.jpg";
const DEFAULT_ALPHA_TEXTURE_URL = "assets/images/brushes/skin1.png";
let global_texture;
export const BRUSH_SETTINGS = {
    "default": {
        "radius": 0.04,
        "strength": 1.0,
        "color": BABYLON.Color3.White(),
        "brightness": 0.0,
        "opacity": 0.05,
        "mixTexture": false,
        "textureUrl": DEFAULT_TEXTURE_URL,
        "useAlphaTexture": false,
        "alphaTextureUrl": DEFAULT_ALPHA_TEXTURE_URL,
        "invertAlphaTexture": false,
        "applyMixTextureAlpha": false
    },
    "textured": {
        "radius": 0.04,
        "strength": 1.0,
        "color": BABYLON.Color3.White(),
        "brightness": 0.0,
        "opacity": 0.05,
        "mixTexture": true,
        "textureUrl": DEFAULT_TEXTURE_URL,
        "useAlphaTexture": false,
        "alphaTextureUrl": DEFAULT_ALPHA_TEXTURE_URL,
        "invertAlphaTexture": false,
        "applyMixTextureAlpha": false
    },
    "alpha": {
        "radius": 0.04,
        "strength": 1.0,
        "color": BABYLON.Color3.White(),
        "brightness": 0.0,
        "opacity": 0.05,
        "mixTexture": false,
        "textureUrl": DEFAULT_TEXTURE_URL,
        "useAlphaTexture": true,
        "alphaTextureUrl": DEFAULT_ALPHA_TEXTURE_URL,
        "invertAlphaTexture": false,
        "applyMixTextureAlpha": false
    },
    "texturedAlpha": {
        "radius": 0.04,
        "strength": 1.0,
        "color": BABYLON.Color3.White(),
        "brightness": 0.0,
        "opacity": 0.05,
        "mixTexture": true,
        "textureUrl": "assets/images/pepsi.png",
        "useAlphaTexture": false,
        "alphaTextureUrl": DEFAULT_ALPHA_TEXTURE_URL,
        "invertAlphaTexture": false,
        "applyMixTextureAlpha": true
    },
}

export function applyBrushSettings(brushShader, settings, reset = false){
    if(!global_texture){
        global_texture = new BABYLON.RawTexture(null, 512, 512);
    }
    if(reset){
        brushShader.setFloat("radius", settings.radius);
        brushShader.setFloat("strength", settings.strength);
        brushShader.setColor3("color", settings.color);
        brushShader.setFloat("opacity", settings.opacity);
        brushShader.setFloat("brightness", settings.brightness);
    }else{
        settings.radius = states.currentBrush.radius;
        settings.strength = states.currentBrush.strength;
        settings.opacity = states.currentBrush.opacity;
        settings.brightness = states.currentBrush.brightness;
        settings.color = states.currentBrush.color;
    }
    brushShader.setFloat("useAlphaTexture", settings.useAlphaTexture);
    brushShader.setFloat("mixTexture", settings.mixTexture);
    brushShader.setFloat("applyMixTextureAlpha", settings.applyMixTextureAlpha);
    brushShader.setTexture("undoSampler", global_texture);
    brushShader.setTexture("brushAlphaSampler", global_texture);
    brushShader.setFloat("invertAlphaTexture", settings.invertAlphaTexture);

    let mix_texture = new BABYLON.Texture(DEFAULT_TEXTURE_URL+"", global.scene);
    mix_texture.hasAlpha = true;
    brushShader.setTexture("brushSampler", mix_texture);

    if(settings.mixTexture){
        mix_texture = new BABYLON.Texture(settings.textureUrl+"", global.scene);
        mix_texture.hasAlpha = true;
        brushShader.setTexture("brushSampler", mix_texture);
    }
    if(settings.useAlphaTexture){
        brushShader.setTexture("brushAlphaSampler", new BABYLON.Texture(settings.alphaTextureUrl+"", global.scene));
    }

}