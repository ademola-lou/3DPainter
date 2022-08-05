import { states } from "../../../utils/state";

// GUI
export function startUI(){
const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
const panel = new BABYLON.GUI.StackPanel();
panel.width = "220px";
panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
advancedTexture.addControl(panel);
// panel.spacing = 7

addLockButton(advancedTexture);

const sliderpanel = new BABYLON.GUI.Rectangle();
sliderpanel.height = "220px";
sliderpanel.width = "50px"
sliderpanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
sliderpanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
sliderpanel.isVertical = false;
sliderpanel.left = 10;
sliderpanel.background = "black"
sliderpanel.cornerRadius = 20
sliderpanel.thickness = 0;
panel.addControl(sliderpanel);

const brushSizeControl = addSlider(sliderpanel, states.radius, 25, true, false, true);
const brushOpacityControl = addSlider(sliderpanel, states.radius, 5, true, false, true);

brushSizeControl.onValueChangedObservable.add(function(value) {
    states.radius = value;
});

// sliderRadius.onValueChangedObservable.add(function(value) {
//     radius = value;
// });

openColorWheelButton(panel, addColorWheel(advancedTexture), 50);
}

function openColorWheelButton(panel, colorWheel, size){
    const button = new BABYLON.GUI.Button('button');
        button.width = size +"px";
        button.height = size +"px";
        button.color = "white";
        button.thickness = 0;

    const ellipse1 = new BABYLON.GUI.Ellipse();
        ellipse1.width = size +"px";
        ellipse1.height = size +"px";
        ellipse1.color = "Orange";
        ellipse1.thickness = 2;
        ellipse1.background = `rgb(${255 * states.color.r}, ${ 255 * states.color.g}, ${ 255 * states.color.b})`;
        button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.left = 10;
        button.addControl(ellipse1); 
        panel.addControl(button)

    button.onPointerDownObservable.add(()=>{
        colorWheel.isVisible = !colorWheel.isVisible;
        colorWheel.isEnabled = !colorWheel.isEnabled;
    })

    document.addEventListener("colorPicked", ev =>{
        ellipse1.background = `rgb(${255 * ev.detail.r}, ${ 255 * ev.detail.g}, ${ 255 * ev.detail.b})`;
    })
    //update pallete
    document.addEventListener("updatePallete", ev =>{
        ellipse1.background = `rgb(${255 * ev.detail.r}, ${ 255 * ev.detail.g}, ${ 255 * ev.detail.b})`;
        colorWheel.value = new BABYLON.Color3(states.color.r, states.color.g, states.color.b)
    })
    
    scene.onPointerUp = function(){
        colorWheel.isVisible = false;
    }
}
function addColorWheel(panel){
    const picker = new BABYLON.GUI.ColorPicker();
    picker.value = BABYLON.Color3.White();
    picker.height = "250px";
    picker.width = "250px";
    picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    picker.isVisible = false;
    picker.isEnabled = false;
    picker.onValueChangedObservable.add(function(value) {
        states.color.set(value.r, value.g, value.b);
        document.dispatchEvent(new CustomEvent("colorPicked", {detail: states.color}));
    });
    panel.addControl(picker);
    

    return picker;
}

function addSlider(panel, radius, offset, isVertical, isClamped, displayThumb){
    const slider = new BABYLON.GUI.ImageBasedSlider();
    slider.minimum = 0;
    slider.maximum = 0.05;
    slider.value = radius;
    slider.width = "20px";
    slider.height = "200px";
    slider.isVertical = isVertical;
    slider.isThumbClamped = isClamped;
    slider.displayThumb = displayThumb;
    slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    slider.left = offset;
    if (!isVertical) {
        slider.backgroundImage = new BABYLON.GUI.Image("back", "https://playground.babylonjs.com/textures/gui/backgroundImage.png");
        slider.valueBarImage = new BABYLON.GUI.Image("value", "https://playground.babylonjs.com/textures/gui/valueImage.png");
    }
    else {
        slider.backgroundImage = new BABYLON.GUI.Image("back", "https://playground.babylonjs.com/textures/gui/backgroundImage-vertical.png");
        slider.valueBarImage = new BABYLON.GUI.Image("value", "https://playground.babylonjs.com/textures/gui/valueImage-vertical.png");
    }
    slider.thumbImage = new BABYLON.GUI.Image("thumb", "https://playground.babylonjs.com/textures/gui/thumb.png");

    panel.addControl(slider)

    return slider;

}

function addLockButton(panel){
    var button = BABYLON.GUI.Button.CreateImageOnlyButton(
        "but",
        "assets/images/ui/padlock-unlock.png"
      );
    button.width = "30px";
    button.height = "30px";
    button.color = "red"
    button.thickness = 0;
    button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button.top = 180;
    button.left = 20;
    panel.addControl(button);
    
    const camera = scene.activeCamera;
    const canvas = document.getElementById("renderCanvas");
    
    button.onPointerClickObservable.add(()=>{
        states.lockScreen = !states.lockScreen;
        if(states.lockScreen){
            button.children[0].source = "assets/images/ui/lock.png";
            camera.detachControl();
            
        }else{
            button.children[0].source = "assets/images/ui/padlock-unlock.png";
            camera.attachControl(canvas, true)
            
        }
    })
}