const canvas = document.getElementById("gameCanvas");
const fluidDensity = document.getElementById("densitySlider");
const toyDensity = document.getElementById("toyDensitySlider");
const forcesToggle = document.getElementById("forceToggle")

const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 17; // -17 for scrollbar width
canvas.height = window.innerHeight;

const fluidRestingHeight = .5 * canvas.height;
let fluidHeight = fluidRestingHeight;
const fluidWidth = canvas.width * .6; // no physics beyond this point

const gravity = 1;
const airFric = .99;
const fluidFric = .95;

const arrowMultiplier = .001;

const allToys = [];

let selectedToy = null;
let grabbing = false;
let mouse = { x:0, y:0 };

/****************************************/
/************* CREATE TOYS **************/
/****************************************/

let circlePath = (resolution, r) => { // generate circle path with 'resolution' number of points and radius of 'r'
    let path = [];
    for (let i = resolution; i >= 0; i--)
        path.push(Math.cos(i/resolution * Math.PI*2) * r, Math.sin(i/resolution * Math.PI*2) * r);
    return path;
}

allToys.push(new Toy( // Simple rectangle (400x200)
    fluidWidth/2, 10, 400*200, // X, Y, MASS (set mass so density is 1)
    [-200,-100, 200,-100, 200,100, -200,100], // RENDER PATH
    // FIND AREA OF WATER DISPLACED
    y => {
        let toyHeight = y + 100 - fluidHeight;
        return Math.min(Math.max(toyHeight * 400, 0), 400*200); // constrains between 0 and 400*200
    },
    // CHECK IF MOUSE IS OVER
    (x, y, mouseX, mouseY) => {
        return x + 200 > mouseX && x - 200 < mouseX && y + 100 > mouseY && y - 100 < mouseY;
    }
));

allToys.push(new Toy( // Simple circle (r=20)
    fluidWidth +75, canvas.height -50, 88*88, // x, y, mass
    circlePath(36, 50), // RENDER PATH
    // FIND AREA OF WATER DISPLACED, approximate using a square cuz I don't want to implement integrals
    y => {
        let toyHeight = y+50 - fluidHeight;
        let approxWidth = 50*50*Math.PI / (50+50); // area of circle over the max height
        if (toyHeight > 0)
            return Math.min(toyHeight * approxWidth, (50+50) * approxWidth);
        else return 0;
    },
    // CHECK IF MOUSE IS OVER
    (x, y, mouseX, mouseY) => {
        return (x-mouseX)*(x-mouseX) + (y-mouseY)*(y-mouseY) < 50*50;
    }
));

/**********************************/ // TODO: add this to a utils.js file?
/************* UTILS **************/
/**********************************/

function getMouse(e){ // parameter is a MouseEvent
    // https://stackoverflow.com/questions/3234256/find-mouse-position-relative-to-element
    let mouseX = e.pageX - e.currentTarget.offsetLeft;
    let mouseY = e.pageY - e.currentTarget.offsetTop;

    return { x: mouseX, y: mouseY }
}

/**********************************/
/********* MAIN FUNCTIONS *********/
/**********************************/
function parallelDisplace(iterations = 5) {
    let displacements = [];
    let prevDisplacements = [];
    for (let i = 0; i < allToys.length; i++){ // initialize arrays
        displacements.push(0);
        prevDisplacements.push(0);
    }

    for (let i = 0; i < iterations; i++){ // iteratively...
        // STEP 1: find how much each toy displaces the water
        for (let j = 0; j < allToys.length; j++){
            if (allToys[j].x + allToys[j].width/2 < fluidWidth){
                displacements[j] = allToys[j].displace();
            }
        }
        // STEP 2: displace the water
        for (let j = 0; j < displacements.length; j++){
            fluidHeight -= displacements[j]; // compute current displacements
            fluidHeight += prevDisplacements[j]; // cancel previous displacements
            prevDisplacements[j] = displacements[j];
        }
        // REPEAT iterations NUMBER OF TIMES
    }
}

function update(){
    fluidHeight = fluidRestingHeight;
    
    parallelDisplace();

    for (const t of allToys){
        t.updateVels();
        if (t == selectedToy){
            if (!grabbing){
                t.move();
            }
            t.densityMultiplier = toyDensity.value;
        }else {
            t.move();
        }
    }
    if (grabbing){
        selectedToy.grab();
    }
}
function render(){
    ctx.fillStyle = "dimgrey";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    // draw water
    ctx.fillStyle = "cornflowerblue";
    ctx.fillRect(0,fluidHeight,fluidWidth,canvas.height-fluidHeight);

    // draw toys
    for (const t of allToys){
        t.render(ctx);
    }
    if (forcesToggle.checked){
        for (const t of allToys){
            if (t.x + t.width/2 > fluidWidth) continue;

            ctx.lineWidth = 5;
            // draw buoyant force up
            ctx.strokeStyle = "blue";
            ctx.fillStyle = "blue";
            t.renderArrow(ctx, t.x, t.y - t.height/2, t.x, t.y - t.height/2 - fluidDensity.value * gravity * t.areaFunction(t.y) * arrowMultiplier);
            // draw gravitational force down
            ctx.strokeStyle = "brown";
            ctx.fillStyle = "brown";
            t.renderArrow(ctx, t.x, t.y + t.height/2, t.x, t.y + t.height/2 + gravity*t.mass*t.densityMultiplier * arrowMultiplier);
            ctx.lineWidth = 1;
        }
    }

    // tints things underwater blue
    ctx.fillStyle = "cornflowerblue";
    ctx.globalAlpha = .5;
    ctx.fillRect(0,fluidHeight,fluidWidth,canvas.height-fluidHeight);
    ctx.globalAlpha = 1;

    // highlight selected toy
    if (selectedToy != null){
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(selectedToy.x + selectedToy.path[0],selectedToy.y + selectedToy.path[1]);
        for (let i = 2, n = selectedToy.path.length-1; i < n; i += 2){
            ctx.lineTo(selectedToy.x + selectedToy.path[i],selectedToy.y + selectedToy.path[i+1]);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // resting waterline
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(0,canvas.height-fluidRestingHeight);
    ctx.lineTo(fluidWidth,canvas.height-fluidRestingHeight);
    ctx.closePath();
    ctx.stroke();
}
function game_loop(){

    update();
    render();

    window.requestAnimationFrame(game_loop);
}

game_loop();

/**************************/
/***** EVENT LISTENERS ****/
/**************************/

// simulation interactive pieces


// mouse events
canvas.onmousedown = e => {
    mouse = getMouse(e);
    for (const t of allToys){
        if (t.mouseoverFunction(t.x, t.y, mouse.x, mouse.y)){
            selectedToy = t;
            grabbing = true;

            t.mouseDiff.x = -mouse.x + t.x;
            t.mouseDiff.y = -mouse.y + t.y;

            toyDensity.value = t.densityMultiplier;
            toyDensity.oninput(); // updates the slider display (see ../css/csshelper.js)
            
            return;
        }
    }
    selectedToy = null;
    grabbing = false;
};
canvas.onmouseup = e => {
    if (grabbing){
        selectedToy.mouseDiff.x = 0;
        selectedToy.mouseDiff.y = 0;

        grabbing = false;
    }
}
canvas.onmousemove = e => {
    mouse = getMouse(e);
}