import { states } from "../../../utils/state";

// GUI
export function startUI(){
const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
const panel = new BABYLON.GUI.StackPanel();
panel.width = "220px";
panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
advancedTexture.addControl(panel);
panel.spacing = 7

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

const brushSizeControl = addSlider(sliderpanel, states.currentBrush.radius, 25, 0.05);
const brushBrightnessControl = addSlider(sliderpanel, states.currentBrush.brightness, 5, 10.0);

brushSizeControl.onValueChangedObservable.add(function(value) {
    states.currentBrush.radius = value;
});

brushBrightnessControl.onValueChangedObservable.add(function(value) {
    states.currentBrush.brightness = value * 10;
    console.log("opacity val: ", value, (value * 10))
});

openColorWheelButton(panel, addColorWheel(advancedTexture), 50);

const undoButton = BABYLON.GUI.Button.CreateSimpleButton("but1", "undo");
undoButton.width = "50px";
undoButton.height = "50px";
undoButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
undoButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
undoButton.left = "12px";
undoButton.thickness = 5;
undoButton.cornerRadius = 50;
panel.addControl(undoButton);

undoButton.onPointerDownObservable.add(()=>{
    document.dispatchEvent(new CustomEvent("undoChanges"));
});

}

function openColorWheelButton(panel, colorWheel, size){
    const {color} = states.currentBrush;

    const button = new BABYLON.GUI.Button('button');
        button.width = size +"px";
        button.height = size +"px";
        button.color = "white";
        button.thickness = 0;

    const ellipse1 = new BABYLON.GUI.Ellipse();
        ellipse1.width = size +"px";
        ellipse1.height = size +"px";
        ellipse1.color = "Orange";
        ellipse1.thickness = 4;
        ellipse1.background = `rgb(${255 * color.r}, ${ 255 * color.g}, ${ 255 * color.b})`;
        button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.left = 10;
        button.addControl(ellipse1); 
        panel.addControl(button)

    button.onPointerDownObservable.add(()=>{
        colorWheel.isVisible = !colorWheel.isVisible;
        colorWheel.isEnabled = !colorWheel.isEnabled;
    });

    document.addEventListener("colorPicked", ev =>{
        ellipse1.background = `rgb(${255 * ev.detail.r}, ${ 255 * ev.detail.g}, ${ 255 * ev.detail.b})`;
    })
    //update pallete
    document.addEventListener("updatePallete", ev =>{
        const {color} = states.currentBrush;

        ellipse1.background = `rgb(${255 * ev.detail.r}, ${ 255 * ev.detail.g}, ${ 255 * ev.detail.b})`;
        colorWheel.value = new BABYLON.Color3(color.r, color.g, color.b)
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

    const {color} = states.currentBrush;

    picker.onValueChangedObservable.add(function(value) {
        color.set(value.r, value.g, value.b);
        document.dispatchEvent(new CustomEvent("colorPicked", {detail: color}));
    });
    panel.addControl(picker);
    

    return picker;
}

function addSlider(panel, radius, offset, max){
    const slider = new BABYLON.GUI.Slider();
    slider.minimum = 0;
    slider.maximum = max;
    slider.value = radius;
    slider.width = "20px";
    slider.height = "200px";
    slider.color = "rgb(45, 25, 25)";
    slider.background = "#2e5090";
    slider.isThumbCircle = true;
    slider.isVertical = true;
    slider.isThumbClamped = true;
    slider.displayThumb = true;
    slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    slider.left = offset;

    panel.addControl(slider)

    return slider;

}

function addLockButton(panel){
    
    let size = 30;
    const button = new BABYLON.GUI.Button('button');
        button.width = size +"px";
        button.height = size +"px";
        button.color = "white";
        button.thickness = 0;
        button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        button.top = 180;
        button.left = 20;

    const ellipse1 = new BABYLON.GUI.Ellipse();
        ellipse1.width = size +"px";
        ellipse1.height = size +"px";
        ellipse1.color = "Orange";
        ellipse1.thickness = 5;
        ellipse1.background = "red"
        button.addControl(ellipse1); 
        panel.addControl(button)


    const camera = scene.activeCamera;
    const canvas = document.getElementById("renderCanvas");
    
    button.onPointerClickObservable.add(()=>{
        states.lockScreen = !states.lockScreen;
        if(states.lockScreen){
            button.children[0].background = "green";
            camera.detachControl();
            
        }else{
            button.children[0].background = "red";
            camera.attachControl(canvas, true)
            
        }
    })
}