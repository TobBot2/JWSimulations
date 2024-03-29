/**
 * Gravity Simulation's main js file. 
 * TODO:
 * Add collision?
 * Fix velocities in presets so they scale accordingly 
 *  - CHANGE g constant based on units (multiply by scale^2? and divide by mass scale^2?)
 * Add gamey elements (coins, preset 'problems', sound?)
 */

const canvas = document.getElementById("gameCanvas");
const colorInput = document.getElementById("planetColor");
const massInput = document.getElementById("massSlider");
const sizeInput = document.getElementById("sizeSlider");
const pathOpacityInput = document.getElementById("pathOpacitySlider");
const navigateMode = document.getElementById("navigateMode");
const showVelsInput = document.getElementById("showVels");
const showForcesInput = document.getElementById("showForces");
const showStarsInput = document.getElementById("showStars");

const zoomDisplay = document.getElementById("zoomDisplay");
const simSpeedDiplay = document.getElementById("simSpeedDisplay");

const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 17; // - 17 for scrollbar
canvas.height = window.innerHeight;

let mouse = {
    x: 0,
    y: 0
};

const gConst = 1; // gravitational constant (kind of works like the speed too)
const velDampener = .005; // dampens velocity so pixel size and in-code vel are not 1:1

const allPlanets = [];
let sPlanetIndex = -1; // selected planet index
let fPlanetIndex = -1; // focused planet index

let placing = false;
let grab = {
    grabbing: false,
    xDiff: 0,
    yDiff: 0
}

let playing = false;
let atStart = true;
let simSpeed = 1;
let zoom = 1;
let minZoom = 1/Math.pow(2,7);
let xTranslate = 0;
let yTranslate = 0;
let pathStats = {
    size: 0,
    maxSize: 30000,
    calculateSpeed: 100,
};

let stars = [];
for (let i = 0; i < 50; i++){
    stars.push( { x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 3} );
}

function getMouse(e){ // parameter is a MouseEvent
    // https://stackoverflow.com/questions/3234256/find-mouse-position-relative-to-element
    let mouseX = e.pageX - e.currentTarget.offsetLeft;
    let mouseY = e.pageY - e.currentTarget.offsetTop;

    mouseX /= zoom;
    mouseY /= zoom;
    
    mouseX += canvas.width / 2 * (1 - 1/zoom) + xTranslate;
    mouseY += canvas.height / 2 * (1 - 1/zoom) + yTranslate;

    if (fPlanetIndex != -1){ // if centered on planet, adjust
        const p = allPlanets[fPlanetIndex];
        mouseX -= -p.x + canvas.width/2;
        mouseY -= -p.y + canvas.height/2;
    }

    return { x: mouseX, y: mouseY }
}
// ============ button functions ===============
function togglePlaySimulation(){
    playing = !playing;
    sPlanetIndex = -1;
    atStart = false;
}
function resetSimulation(){
    playing = false;
    atStart = true;
    for (let p of allPlanets){
        p.resetSimulation();
    }
}
function focusCurrentPlanet(){
    
    if (sPlanetIndex == -1 && fPlanetIndex == -1){
        alert("You must select a planet first in order to follow or unfollow it");
    }
    fPlanetIndex = sPlanetIndex;
    xTranslate = 0;
    yTranslate = 0;
}
function primePlace(){
    if (!atStart) {
        alert("You can only place planets at the start of the simulation!");
        return;
    }
    placing = !placing;
}
function loadPreset(i){ // i is the index in presets.json
    resetSimulation();
    allPlanets.length = 0;

    let dstScale = presets[i][0];
    
    for (let j = 1; j < presets[i].length; j++){
        const pInfo = presets[i][j];
        let newP = new Planet(pInfo.x * dstScale, pInfo.y * canvas.height, pInfo.mass, pInfo.radius * dstScale, pInfo.color);
        newP.initVelY = pInfo.vel * dstScale * 13000;
        newP.applyInitValues();
        allPlanets.push(newP);
    }
    clearVelsInPaths();
}
// ============ path stuff ==================
function calculateNextVelInPaths(){
    pathStats.size += pathStats.calculateSpeed;
    for (let i = 0; i < pathStats.calculateSpeed; i++){
        for (const p of allPlanets){
            p.calculateNextVelInPath();
        }
    }
}
function clearVelsInPaths(){
    pathStats.size = 0;
    for (const p of allPlanets){
        p.clearVelsInPath();
    }
}
/*  =========================
          main functions
    ========================= */
function update(){
    // ========== update planets ==============
    if (playing){
        for (let i = 0; i < simSpeed; i++){
            for (const p of allPlanets){
                p.update();
            }
            for (const p of allPlanets){
                p.lateUpdate();
            }
        }
    } else {
        if (grab.grabbing && sPlanetIndex != -1 && !navigateMode.checked){
            allPlanets[sPlanetIndex].initX = mouse.x + grab.xDiff;
            allPlanets[sPlanetIndex].initY = mouse.y + grab.yDiff;
            allPlanets[sPlanetIndex].applyInitValues();
            clearVelsInPaths();
        }else if (grab.grabbing && navigateMode.checked){
            xTranslate = mouse.x - xTranslate + grab.xDiff;
            yTranslate = mouse.y - yTranslate + grab.yDiff;
        }

        if (pathOpacityInput.value != 0 && pathStats.size < pathStats.maxSize)
            calculateNextVelInPaths();
    }
}
function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height); // style, background-color is already black

    // draw stars before translation
    if (showStarsInput.checked){
        for (const s of stars){ // draw stars (before translation & scale, because they are lightyears away)
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(s.x, s.y, s.r, 0, Math.PI*2, false);
            ctx.fill();
            ctx.closePath();
        }
    }
    
    // translate/zoom
    let focusedTranslation = {
        x: canvas.width / 2 * (1-1/zoom) - xTranslate,
        y: canvas.height / 2 * (1-1/zoom) - yTranslate
    }
    if (fPlanetIndex != -1) {
        focusedTranslation.x += allPlanets[fPlanetIndex].x - canvas.width/2;
        focusedTranslation.y += allPlanets[fPlanetIndex].y - canvas.height/2;
    }
    ctx.scale(zoom, zoom);
    ctx.translate(-focusedTranslation.x, -focusedTranslation.y);

    for (const p of allPlanets){ // draw planets
        p.render(ctx);
    }
    
    // ================ draw gizmos ===================== \\
    let focusedPlanet = null;
    if (fPlanetIndex != -1) focusedPlanet = allPlanets[fPlanetIndex];
    for (const p of allPlanets){
        if (pathOpacityInput.value != 0); // don't bother rendering if the opacity is 0.
            p.renderPath(ctx, focusedPlanet);
        if (showVelsInput.checked)
            p.renderVel(ctx);
        if (showForcesInput.checked)
            p.renderForces(ctx);
    }
    // ============= highlights selected planet ============== \\
    if (sPlanetIndex != -1){
        const p = allPlanets[sPlanetIndex];
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2, false);
        ctx.stroke();
        ctx.closePath();
    }

    if (placing){
        ctx.globalAlpha = .5;
        ctx.fillStyle = colorInput.value;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, sizeInput.value, 0,Math.PI*2,false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    ctx.translate(focusedTranslation.x, focusedTranslation.y);
    ctx.scale(1/zoom, 1/zoom);
}

function gameLoop(){
    update();
    render();
    window.requestAnimationFrame(gameLoop);
}

gameLoop();

// ==================== canvas mouse inputs ====================================
canvas.onmousedown = e => { // ON LEFT CLICK    
    mouse = getMouse(e);

    if (e.button != 0) return;

    grab.grabbing = false;

    if (navigateMode.checked){
        if (fPlanetIndex != -1){
            alert("By using 'navigate mode', you have stopped following a planet");
            fPlanetIndex = -1;
        }

        grab.grabbing = true;
        grab.xDiff = xTranslate - mouse.x;
        grab.yDiff = yTranslate - mouse.y;
    }
    // IF --NOT-- IN NAVIGATE MODE
    else if (placing){ // place planet?
        placing = false;
        sPlanetIndex = allPlanets.length;
        allPlanets.push(new Planet(mouse.x, mouse.y, massInput.value, sizeInput.value, colorInput.value));
        clearVelsInPaths();
    }else {
        sPlanetIndex = -1;

        for (let i = 0; i < allPlanets.length; i++){ // select/grab planet?
            const p = allPlanets[i];
            if ((p.x - mouse.x)*(p.x - mouse.x) + (p.y - mouse.y)*(p.y - mouse.y) < p.radius * p.radius){
                if (sPlanetIndex == -1 || allPlanets[sPlanetIndex].radius > p.radius){ // select planet with smallest radius that is touching cursor
                    sPlanetIndex = i; // select

                    if (!playing){ // if not mid-simulation,    
                        grab.grabbing = true; // also grab
                        grab.xDiff = p.x - mouse.x;
                        grab.yDiff = p.y - mouse.y;
                    }
                }
            }
        }
    }
}
canvas.onmouseup = e => {
    grab.grabbing = false;
}
canvas.onmousemove = e => {
    mouse = getMouse(e);
}
canvas.oncontextmenu = e => {
    mouse = getMouse(e);
    
    if (sPlanetIndex != -1){
        // set velocity of planet
        const p = allPlanets[sPlanetIndex];
        p.initVelX = (mouse.x - p.x) * velDampener;
        p.initVelY = (mouse.y - p.y) * velDampener;
        p.applyInitValues();
        clearVelsInPaths();
    }else {
        alert("You must select a planet to set it's velocity");
    }

    return false;
}
window.onkeydown = e => {
    const key = e.keyCode;
    // ZOOM IN/OUT -------------------------------------------------
    if (key == 38){ // up arrowkey
        e.preventDefault();
        zoom *= 2
    }else if (key == 40){ // down arrowkey
        e.preventDefault();
        zoom /= 2;
        if (zoom < minZoom){
            zoom = minZoom;
        }
    }
    zoomDisplay.textContent = "Zoom: \r\n" + zoom.toFixed(2) + "x";

    if (key == 39){ // right arrowkey
        simSpeed++;
    }else if (key == 37){ // left arrowkey
        simSpeed--;
        if (simSpeed <= 0){
            simSpeed = 1;
        }
    }
    simSpeedDiplay.textContent = "Simulation Speed: \r\n" + simSpeed + "x";

    if (key == 32){ // space bar
        togglePlaySimulation();
    }

    // DELETE SELECTED PLANET --------------------------------------
    if (key == 8 || key == 46){ // delete/backspace key
        if (sPlanetIndex != -1){
            allPlanets.splice(sPlanetIndex, 1);
            if (sPlanetIndex == fPlanetIndex){
                fPlanetIndex = -1;
            }
            sPlanetIndex = -1;
            clearVelsInPaths();
        }else {
            alert("you must select a planet to delete it");
        }
    }
}